"use server";

import { File } from "@/lib/generated/prisma";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const generateEmbeddings = async (docId: string) => {
  // console.log("generate embeddings 0");
  auth.protect();

  await generateEmbeddingsInPineconeVectorStore(docId);

  revalidatePath("/dashboard");
  console.log("generate embeddings function");
  return {
    completed: true,
  };
};
