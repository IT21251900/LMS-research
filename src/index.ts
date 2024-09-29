import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { queryLLM } from './utils/langchainHandler';
import { extractTextFromPDF } from './utils/pdfParser';
import { initializeVectorStore, getRelevantContext } from './utils/vectorStore';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//health check
app.get('/health', (req, res) => {
  res.send('Health check');
});


app.use(express.json());

app.post('/process-pdf', async (req: Request, res: Response) => {
    const { pdfPath, question } = req.body;

    try {
        // Step 1: Extract text from the PDF
        const extractedText = await extractTextFromPDF(pdfPath);

        // Step 2: Initialize the vector store with extracted text
        await initializeVectorStore(extractedText);

        // Step 3: Retrieve relevant context based on the question
        const relevantContext = await getRelevantContext(question);
        const combinedContext = relevantContext.join('\n');

        // Step 4: Ask the LLM a question with the retrieved context
        const combinedInput = `Context: ${combinedContext}\n\nQuestion: ${question}`;
        const llmResponse = await queryLLM(combinedInput);

        res.status(200).json({
            // relevantContext,
            llmResponse,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process PDF or query LLM' });
    }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


