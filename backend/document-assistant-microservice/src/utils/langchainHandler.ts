import { OpenAI } from "@langchain/openai";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const openAIModel = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

export const queryLLM = async (text: string): Promise<string> => {
  const prompt = `
      You are a study assistant helping with questions specifically related to the provided document. 
      Answer queries only within the provided context. If the query is unrelated, state that the query is outside the document's scope politely.
      ${text}
  `;

  const response = await openAIModel.invoke(prompt);
  return response;
};