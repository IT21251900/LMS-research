import type { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

dotenv.config();

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-ada-002',
    openAIApiKey: process.env.OPENAI_API_KEY!,
});

let vectorStore: MemoryVectorStore | null = null;

// Initialize vector store
export const initializeVectorStore = async (text: string): Promise<void> => {
    const documents = await createDocumentsFromText(text); // Await the promise

    if (!vectorStore) {
        vectorStore = new MemoryVectorStore(embeddings);
    }

    await vectorStore.addDocuments(documents); // Add documents after awaiting the creation
};

// Split text into document objects
const createDocumentsFromText = async (text: string): Promise<Document[]> => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500, // Increase or decrease this value based on content
        chunkOverlap: 300, // Increase overlap to ensure context is maintained
    });

    const chunks = await splitter.createDocuments([text]); // Split the entire text into coherent chunks
    return chunks.map(chunk => ({
        pageContent: chunk.pageContent,
        metadata: { source: 'extracted-pdf' },
    }));
};

// Retrieve relevant context using vector similarity search
export const getRelevantContext = async (query: string): Promise<string[]> => {
    if (!vectorStore) throw new Error('Vector store is not initialized');

    const result = await vectorStore.similaritySearch(query, 3); // Retrieve top 3 relevant chunks
    return result.map(r => r.pageContent); // Return the most relevant document contents
};
