import { useState, useEffect } from "react";
import {
  useFileAppFiles,
  useAddFilesAppFile,
  useDeleteFilesAppFile,
  useWebNativeFileUpload,
  AppFile,
} from "../../np/webFilesApp";
import { useProjectId } from "../../np/projects";

const FileAppExample = () => {
  const { projectId } = useProjectId();

  // Hooks for CRUD operations
  const {
    result: files,
    loading: loadingFiles,
    refetchByUser,
  } = useFileAppFiles(projectId ?? undefined);

  const {
    submit: addFile,
    loading: adding,
    error: addError,
  } = useAddFilesAppFile(projectId ?? undefined);
  const {
    submit: deleteFile,
    loading: deleting,
    error: deleteError,
  } = useDeleteFilesAppFile(projectId ?? undefined);

  const { uploadFileFromUri, loading: uploadKeys } = useWebNativeFileUpload({
    projectId: projectId ?? "",
  });

  const isUploading = Object.keys(uploadKeys).length > 0;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectId) return;

    const tempId = Date.now().toString();

    try {
      // Upload to storage (gets URL and meta)
      const uploaded: AppFile = await uploadFileFromUri({
        id: tempId,
        uri: URL.createObjectURL(selectedFile),
      });

      // Persist to DB (ensure correct payload)
      const record: AppFile = {
        ...uploaded,
        size: Number(uploaded.size),
        name: selectedFile.name,
      };

      addFile(record, (message) => {
        console.log("[addFile] Success:", message);
        setSelectedFile(null);
        refetchByUser();
      });
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDelete = (fileId: string) => {
    if (!projectId) return;
    deleteFile({ id: fileId }, () => {
      refetchByUser();
    });
  };

  // Log and surface addError
  useEffect(() => {
    if (addError) {
      console.error("[addFile] Error:", addError);
      alert("Failed to save file meta: " + addError);
    }
  }, [addError]);

  // surface server message
  useEffect(() => {
    if (deleteError) {
      console.error("[deleteFile] Error:", deleteError);
      alert("Delete failed: " + deleteError);
    }
  }, [deleteError]);

  if (!projectId) {
    return <p>Please select a workspace to load files.</p>;
  }

  return (
    <div style={{ textAlign: "left", marginTop: "2rem" }}>
      <h3>Files (project: {projectId})</h3>

      {/* File List */}
      {loadingFiles ? (
        <p>Loading files...</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {files?.map((f) => (
            <li
              key={f.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <div>
                <strong>{f.name || f.id}</strong>
                <span style={{ marginLeft: "0.5rem", color: "#888" }}>
                  {Math.round(f.size / 1024)} KB
                </span>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                disabled={deleting}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: 0,
                  padding: "0.25rem 0.5rem",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload Section */}
      <div style={{ marginTop: "1rem" }}>
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || adding || isUploading}
          style={{ marginLeft: "0.5rem", padding: "0.25rem 0.75rem" }}
        >
          {adding || isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default FileAppExample;
