import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw new Error("Pinecone API key is not set");
}

export const pc = new Pinecone({
  apiKey,
});
