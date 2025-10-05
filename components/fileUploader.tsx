"use client";

import useUpload from "@/hooks/useUpload";
import { upload } from "@vercel/blob/client";
import { CircleArrowDown, RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = () => {
  const { handleUpload, progress, fileId } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/file/${fileId}`);
    }
  }, [fileId, router]);

  console.log(progress);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Do something with the files
    console.log(acceptedFiles);

    const file = acceptedFiles[0];

    if (file) {
      await handleUpload(file);
    } else {
      // toast notificaiton
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {/* loading here tomorrow */}

      <div
        {...getRootProps()}
        className={`p-19 border-2 border-dashed border-indigo-600 text-indigo-600 mt-10 w-[90%] h-96 flex items-center justify-center rounded-lg ${
          isFocused || isDragActive ? "bg-indigo-300" : "bg-indigo-100"
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex items-center flex-col justify-center ">
          {isDragActive ? (
            <>
              <RocketIcon className="h-20 w-20 animate-ping" />
              <p>Drop the files here ...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-20 w-20 animate-bounce" />
              <p>
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default FileUploader;
