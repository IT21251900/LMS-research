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

// Initialize vector store and send the first response
app.post('/initialize-pdf', async (req: Request, res: Response) => {
  const { pdfPath } = req.body;

  try {
      // Step 1: Extract text from the PDF
      const extractedText = await extractTextFromPDF(pdfPath);

      // Step 2: Initialize the vector store with extracted text
      await initializeVectorStore(extractedText);

      // Step 3: Send a message that the PDF has been processed and is ready for questions
      res.status(200).json({
          message: 'PDF has been processed. Please ask your questions.',
      });
  } catch (error) {
      res.status(500).json({ error: 'Failed to process PDF' });
  }
});

app.post('/ask-question', async (req: Request, res: Response) => {
  const { question } = req.body;

  try {
      // Retrieve relevant context from the vector store based on the user's question
      const relevantContext = await getRelevantContext(question);
      const combinedContext = relevantContext.join('\n');

      // Ask the LLM the question along with the retrieved context
      const combinedInput = `Context: ${combinedContext}\n\nQuestion: ${question}`;
      const llmResponse = await queryLLM(combinedInput);

      res.status(200).json({
          relevantContext,
          llmResponse,
      });
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve context or query LLM' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


