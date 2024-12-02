import type { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const embeddings = new OpenAIEmbeddings({
    model: process.env.EMBEDDING_MODEL,
    openAIApiKey: process.env.OPENAI_API_KEY!,
});

let vectorStore: MemoryVectorStore | null = null;

export const initializeVectorStore = async (text: string): Promise<void> => {
    const documents = await createDocumentsFromText(text); 

    if (!vectorStore) {
        vectorStore = new MemoryVectorStore(embeddings);
    }

    await vectorStore.addDocuments(documents);
};

const createDocumentsFromText = async (text: string): Promise<Document[]> => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500, // Increase or decrease this value based on content
        chunkOverlap: 300, // Increase overlap to ensure context is maintained
    });

    const chunks = await splitter.createDocuments([text]);
    return chunks.map(chunk => ({
        pageContent: chunk.pageContent,
        metadata: { source: 'extracted-pdf' },
    }));
};

export const getRelevantContext = async (query: string): Promise<string[]> => {
    if (!vectorStore) throw new Error('Vector store is not initialized');

    const result = await vectorStore.similaritySearch(query, 3);
    return result.map(r => r.pageContent);
};

export const cleanUpVectorStore = (): void => {
        vectorStore = null;
};