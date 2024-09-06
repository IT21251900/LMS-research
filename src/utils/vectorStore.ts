import type { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

dotenv.config();

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-ada-002',
    openAIApiKey: process.env.OPENAI_API_KEY!,
});

let vectorStore: MemoryVectorStore | null = null;

// Initialize vector store
export const initializeVectorStore = async (text: string): Promise<void> => {
    const documents = createDocumentsFromText(text);
    console.log('documents :', documents);

    // Initialize the vector store with embeddings
    vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(documents);
};

// Split text into document objects
const createDocumentsFromText = (text: string): Document[] => {
    const texts = text.split('\n').filter(t => t.trim() !== '');

    return texts.map(t => ({
        pageContent: t,
        metadata: { source: 'extracted-pdf' }, // Add relevant metadata
    }));
};

// Retrieve relevant context using vector similarity search
export const getRelevantContext = async (query: string): Promise<string[]> => {
    if (!vectorStore) throw new Error('Vector store is not initialized');

    const result = await vectorStore.similaritySearch(query, 3); // Retrieve top 3 relevant chunks
    return result.map(r => r.pageContent); // Return the most relevant document contents
};
