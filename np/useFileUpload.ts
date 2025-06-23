import axios from "axios";
import { useState } from "react";
import { useAuthData } from "../helper/provider";
import { Image, SystemAudio } from "./types";

export const ApiImagesPath = (projectId: string) => {
  return `/images/?projectId=${projectId}`;
};

export const ApiAudioPath = (projectId: string) =>
  `/audio/?projectId=${projectId}`;

export type UploadDef = {
  id: string;
  file: File | Blob;
};

type DownloadKeys = { [key: string]: boolean };

export const useFileUpload = () => {
  const [loading, setLoading] = useState<DownloadKeys>({});
  const { apiBaseUrl } = useAuthData();

  const uploadFile = async <T>(
    id: string,
    file: Blob,
    onComplete: (result: T) => void,
    url: string
  ) => {
    if (!file) {
      throw new Error("Provide blob");
    }

    const formData = new FormData();
    formData.append("file", file);

    performUpload(id, formData, onComplete, url);
  };

  const performUpload = async <T>(
    id: string,
    formData: FormData,
    onComplete: (result: T) => void,
    path: string
  ) => {
    setLoading({
      ...loading,
      [id]: true,
    });

    try {
      const result = await axios.post(apiBaseUrl + path, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (result.status === 200) {
        onComplete(result?.data?.data);
      }
    } catch (e) {
      console.log("Error", e);
    } finally {
      if (loading) {
        delete loading[id];
      }
      setLoading(loading);
    }
  };

  const uploadImage = (
    id: string,
    file: File | Blob,
    url: string
  ): Promise<{ image: Image; uploadId: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      uploadFile<Image>(
        id,
        file,
        (image) => {
          resolve({ image, uploadId: id });
        },
        url
      );
    });
  };

  const uploadAudio = (
    id: string,
    file: File | Blob,
    url: string
  ): Promise<{ audio: SystemAudio; uploadId: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      uploadFile<SystemAudio>(
        id,
        file,
        (audio) => {
          resolve({ audio, uploadId: id });
        },
        url
      );
    });
  };

  const uploadImages = async (
    defs: Array<UploadDef>,
    url: string
  ): Promise<{ uploadId: string; newId: string, image: Image }[]> => {
    const uploaded: { uploadId: string; newId: string; image: Image }[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < defs.filter((e) => e).length; index++) {
      const def = defs[index];
      const defId = def.id;
      const { image, uploadId } = await uploadImage(defId, def.file, url);

      uploaded.push({ uploadId, newId: image.id, image });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      resolve(uploaded);
    });
  };

  return {
    uploadFile,
    uploadImages,
    loading,
    performUpload,
    uploadAudio,
  };
};
