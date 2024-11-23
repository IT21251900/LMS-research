import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { queryLLM } from './utils/langchainHandler';
import { extractTextFromPDF } from './utils/pdfParser';
import { initializeVectorStore, getRelevantContext, cleanUpVectorStore } from './utils/vectorStore';

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());

// Store chat histories temporarily in-memory (will be cleared when the app restarts or chat is closed)
let chatHistory: { role: string, content: string }[] = [];

// Health check
app.get('/health', (req, res) => {
    res.send('Health check');
});

// Initialize vector store and start the conversation
app.post('/initialize-pdf', async (req: Request, res: Response) => {
    const { pdfPath } = req.body;

    try {
        // Step 1: Extract text from the PDF
        const extractedText = await extractTextFromPDF(pdfPath);

        // Step 2: Initialize the vector store with extracted text
        await initializeVectorStore(extractedText);

        // Step 3: Reset chat history for the new conversation
        chatHistory = [
            { role: 'system', content: 'PDF has been processed. You can ask your questions now.' }
        ];

        res.status(200).json({
            message: 'PDF has been processed. Please ask your questions.',
            chatHistory, // Send the chat history
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process PDF' });
    }
});

// Ask a question and continue the chat
app.post('/ask-question', async (req: Request, res: Response) => {
    const { question } = req.body;

    try {
        // Add the user's question to the chat history
        chatHistory.push({ role: 'user', content: question });

        // Retrieve relevant context from the vector store based on the user's question
        const relevantContext = await getRelevantContext(question);

        const combinedContext = relevantContext.join('\n');

        // Ask the LLM the question along with the retrieved context
        const combinedInput = `
            Context:
            ${combinedContext}

            Question:
            ${question}
        `;
        const llmResponse = await queryLLM(combinedInput);

        // Add the LLM's response to the chat history
        chatHistory.push({ role: 'assistant', content: llmResponse });

        res.status(200).json({
            llmResponse,
            chatHistory, // Return the updated chat history
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve context or query LLM' });
    }
});

// Clear the chat history and reset the vector store
app.post('/clear-chat', (req: Request, res: Response) => {
    chatHistory = [];
    cleanUpVectorStore();
    res.status(200).json({ message: 'Session has ended' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
