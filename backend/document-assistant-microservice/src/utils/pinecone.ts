import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function createIndex() {
  await pc.createIndex({
    name: "sample-index",
    dimension: 1536,
    spec: {
      serverless: {
        cloud: "aws",
        region: process.env.PINECONE_ENVIRONMENT!,
      },
    },
    waitUntilReady: true,
  });
}
