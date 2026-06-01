import { useCallback, useState } from "react";
import { useAuthData } from "../helper/provider";
import { getBToken, isTokenExpired } from "../helper/utils";
import type { AppFile } from "./webFilesApp";

// ============================================================================
// Upload V2 — direct-to-GCS resumable uploads
//
// This file is intentionally separate from `webFilesApp.tsx` (the V1 path).
// V1 stays in place and working; V2 lives alongside it so it can be flipped on
// per call site after review without touching the proven code.
//
// How V2 works (the file body NEVER passes through the Cloud Function):
//
//   1. POST  files/upload_session   -> backend opens a GCS resumable session,
//                                       returns { sessionUri, destination, token }
//   2. PUT   <sessionUri>           -> browser streams the raw `File` straight
//                                       to GCS, chunked + resumable, with real
//                                       upload progress (xhr.upload.onprogress)
//   3. POST  files/finalize_upload  -> backend verifies the object, builds the
//                                       public URL and writes the AppFile to RTDB
//
// Why this is better than V1:
//   - No 10 MB Busboy cap and no ~32 MB Cloud Function body limit — uploads are
//     bounded only by GCS (effectively unlimited for our use case).
//   - No `fetch(blobUrl) -> .blob() -> new File()` round trip; we send the
//     original `File`, so there is no "Preparing upload" memory stall.
//   - Resumable: a dropped connection resumes from the last committed byte
//     instead of restarting at 0%.
//   - Single network leg for the bytes (browser -> GCS) instead of the V1
//     double hop (browser -> function -> GCS), so progress is honest end to end.
// ============================================================================

// Resumable upload tuning.
//
// GCS requires every non-final chunk to be a multiple of 256 KiB. 8 MiB keeps
// the request count low for large files while staying small enough that a
// failed chunk is cheap to retry.
const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MiB (multiple of 256 KiB)

const MAX_CHUNK_RETRIES = 5;

type UploadSession = {
  sessionUri: string;
  destination: string;
  token: string;
};

// Join base URL and path without duplicate slashes (mirrors the V1 helper).
const joinUrl = (base: string, path: string) => {
  if (!base) return path;

  const sanitizedBase = base.replace(/\/+$/, "");
  const sanitizedPath = path.replace(/^\/+/, "");

  return `${sanitizedBase}/${sanitizedPath}`;
};

// Small JSON POST to our backend, carrying the bearer token when present.
const postJson = async <T,>(
  apiBaseUrl: string,
  path: string,
  projectId: string,
  body: Record<string, unknown>
): Promise<{ data: T; message: string }> => {
  const url = joinUrl(apiBaseUrl, path) + `?projectId=${projectId}`;

  const token = getBToken();
  const hasValidToken = token && !isTokenExpired(token);

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (hasValidToken) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    credentials: hasValidToken ? "omit" : "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

// PUT a single chunk to the GCS session URI.
//
// Returns the number of bytes GCS has committed so far (parsed from the Range
// response header on a 308 "Resume Incomplete"), or the full size once GCS
// returns 200/201 to signal the upload is complete.
const putChunk = async (
  sessionUri: string,
  file: File,
  start: number,
  end: number,
  totalSize: number
): Promise<{ committed: number; done: boolean }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUri);

    // bytes start-(end-1)/total — `end` is exclusive in our slice math.
    xhr.setRequestHeader(
      "Content-Range",
      `bytes ${start}-${end - 1}/${totalSize}`
    );

    xhr.onload = () => {
      // 200/201 => upload finished. 308 => more chunks expected.
      if (xhr.status === 200 || xhr.status === 201) {
        resolve({ committed: totalSize, done: true });
        return;
      }

      if (xhr.status === 308) {
        const range = xhr.getResponseHeader("Range");
        // Range looks like "bytes=0-8388607"; committed = lastByte + 1.
        const committed = range
          ? parseInt(range.split("-")[1], 10) + 1
          : end;
        resolve({ committed, done: false });
        return;
      }

      reject(new Error(`Chunk upload failed: ${xhr.status} ${xhr.statusText}`));
    };

    xhr.onerror = () => reject(new Error("Chunk upload failed: network error"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    xhr.send(file.slice(start, end));
  });
};

// Ask GCS how many bytes it already has for an in-progress session.
//
// Sent as `Content-Range: bytes *\/total` with an empty body; used to resume
// after a network error without re-uploading committed bytes.
const queryCommittedOffset = async (
  sessionUri: string,
  totalSize: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUri);
    xhr.setRequestHeader("Content-Range", `bytes */${totalSize}`);

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(totalSize);
        return;
      }

      if (xhr.status === 308) {
        const range = xhr.getResponseHeader("Range");
        resolve(range ? parseInt(range.split("-")[1], 10) + 1 : 0);
        return;
      }

      reject(new Error(`Resume query failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Resume query failed: network error"));
    xhr.send();
  });
};

export type UploadFileResumableProps = {
  id: string;
  file: File;
  folderId?: string;
  onProgress?: (percent: number) => void;
};

/**
 * Upload V2 hook — direct-to-GCS resumable uploads.
 *
 * Drop-in alternative to V1's `useWebNativeFileUpload`. Exposes
 * `uploadFileResumable` which returns the finalized `AppFile`.
 */
export const useWebFileUploadV2 = ({ projectId }: { projectId: string }) => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<{ [id: string]: boolean }>({});

  const uploadFileResumable = useCallback(
    async ({
      id,
      file,
      folderId,
      onProgress,
    }: UploadFileResumableProps): Promise<AppFile> => {
      if (!file) {
        throw new Error("File is required");
      }
      if (!projectId) {
        throw new Error("projectId is required");
      }

      setLoading((prev) => ({ ...prev, [id]: true }));

      try {
        // 1. Open a resumable session on the backend.
        const { data: session } = await postJson<UploadSession>(
          apiBaseUrl,
          "files/upload_session",
          projectId,
          { filename: file.name, mimeType: file.type }
        );

        const totalSize = file.size;

        // An empty file still needs one PUT to create the object.
        if (totalSize === 0) {
          await putChunk(session.sessionUri, file, 0, 0, 0);
          onProgress?.(100);
        } else {
          // 2. Stream the file to GCS chunk by chunk, resuming on failure.
          let offset = 0;

          while (offset < totalSize) {
            const end = Math.min(offset + CHUNK_SIZE, totalSize);

            let attempt = 0;
            let committed = offset;

            // Retry the current chunk, re-syncing the offset from GCS so we
            // never re-send committed bytes after a transient network error.
            while (true) {
              try {
                const result = await putChunk(
                  session.sessionUri,
                  file,
                  offset,
                  end,
                  totalSize
                );
                committed = result.committed;
                break;
              } catch (chunkError) {
                attempt += 1;
                if (attempt >= MAX_CHUNK_RETRIES) {
                  throw chunkError;
                }

                // Find out what GCS actually has and resume from there.
                committed = await queryCommittedOffset(
                  session.sessionUri,
                  totalSize
                ).catch(() => offset);
                break;
              }
            }

            offset = committed;
            onProgress?.(Math.round((offset / totalSize) * 100));
          }
        }

        // 3. Finalize — backend verifies the object and writes RTDB metadata.
        const finalizeBody: Record<string, unknown> = {
          destination: session.destination,
          token: session.token,
          mimeType: file.type,
          name: file.name,
        };

        if (folderId) {
          finalizeBody.folderId = folderId;
        }

        const { data: appFile } = await postJson<AppFile>(
          apiBaseUrl,
          "files/finalize_upload",
          projectId,
          finalizeBody
        );

        onProgress?.(100);
        return appFile;
      } finally {
        setLoading((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [apiBaseUrl, projectId]
  );

  return { loading, uploadFileResumable };
};
