import { OpenAI } from "@langchain/openai";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const openAIModel = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

export const queryLLM = async (text: string): Promise<string> => {
  const prompt = `
    You are a university lecturer. Please respond to the following query in a detailed, educational, and structured manner. Use an academic tone and provide examples where necessary.

    Query: ${text}
`;

  const response = await openAIModel.invoke(prompt);
  return response;
};
