"use client";

import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { File as FileModel } from "@/lib/generated/prisma";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Uloading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = (typeof StatusText)[keyof typeof StatusText];

const useUpload = () => {
  const [progress, setProgress] = useState<number | null>(0);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();

  const xhrUpload = (file: File) => {
    return new Promise<FileModel>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;

          setStatus(StatusText.UPLOADING);
          setProgress(percent);
        }
      };

      // Called when upload is done
      xhr.onload = () => {
        if (xhr.status === 200) {
          setStatus(StatusText.UPLOADED);
          setStatus(StatusText.SAVING);

          resolve(JSON.parse(xhr.responseText));
        } else {
          console.log(xhr.response);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      // Set up the request
      xhr.open("POST", "/api/upload", true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });
  };

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    const res = await xhrUpload(file);

    // Generate the AI embeddings
    setStatus(StatusText.GENERATING);
    setFileId(res.id);

    console.log("generating embeddings in the hook");
    await generateEmbeddings(res.id);

    console.log("this is res:");
    console.log(res);
    console.log(res.id);
  };

  return {
    progress,
    fileId,
    status,
    handleUpload,
  };
};
export default useUpload;
