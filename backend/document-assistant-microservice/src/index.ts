import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectDB } from './configs/DBConnect';
import { queryLLM } from './utils/langchainHandler';
import { extractTextFromPDF } from './utils/pdfParser';
import { cleanUpVectorStore, getRelevantContext, initializeVectorStore } from './utils/vectorStore';
import Session from './models/Session';
import { v4 as uuidv4 } from 'uuid';

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());

let chatHistory: { role: string, content: string }[] = [];

// Health check
app.get('/health', (req, res) => {
    res.send('Health check');
});

app.post('/initialize-pdf', async (req: Request, res: Response) => {
    const { pdfPath } = req.body;

    try {
        const sessionId = uuidv4(); 
        const extractedText = await extractTextFromPDF(pdfPath);

        await initializeVectorStore(extractedText);

        chatHistory = [
            { role: 'assistant', content: 'PDF has been processed. You can ask your questions now.' }
        ];

        const newSession = new Session({
            sessionId,
            chatHistory,
        });

        await newSession.save();
        res.status(200).json({
            message: 'PDF has been processed. Please ask your questions.',
            sessionId,
            chatHistory, 
            
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process PDF' });
    }
});

app.post('/ask-question', async (req: Request, res: Response) => {
    const { sessionId, question } = req.body;

    try {
        chatHistory.push({ role: 'user', content: question });

        const relevantContext = await getRelevantContext(question);
        const combinedContext = relevantContext.join('\n');

        const combinedInput = `
        Chat History:
        ${chatHistory.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}

        Context:
        ${combinedContext}

        Question:
        ${question}
    `;
        const llmResponse = await queryLLM(combinedInput);

        chatHistory.push({ role: 'assistant', content: llmResponse });

        await Session.findOneAndUpdate(
            { sessionId },
            { $set: { chatHistory } },
            { new: true }
        );

        res.status(200).json({
            llmResponse,
            chatHistory,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve context or query LLM' });
    }
});

app.post('/clear-chat', (req: Request, res: Response) => {
    chatHistory = [];
    cleanUpVectorStore();
    res.status(200).json({ message: 'Session has ended' });
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});