import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { queryLLM } from './src/utils/langchainHandler';
import { extractTextFromPDF } from './src/utils/pdfParser';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//health check
app.get('/health', (req, res) => {
  res.send('Health check');
});


app.use(express.json());

app.post('/process-pdf', async (req: Request, res: Response) => {
    const { pdfPath } = req.body;

    try {
        const extractedText = await extractTextFromPDF(pdfPath);
        const llmResponse = await queryLLM(extractedText);

        res.status(200).json({
            extractedText,
            llmResponse,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process PDF' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


