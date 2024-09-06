import { OpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const openAIModel = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY!,
});

export const queryLLM = async (text: string): Promise<string> => {
    const response = await openAIModel.call(text);
    return response;
};