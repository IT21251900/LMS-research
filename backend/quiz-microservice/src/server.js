import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import  client  from '../configs/weaviateConfig.js'; 
import { connectDB } from '../configs/mongoConfig.js';
import quizRoutes from './routes/quizRoutes.js';

// Load environment variables
config();

export const quizService = express();

// Middleware
quizService.use(cors());
quizService.use(cookieParser());
quizService.use(express.json());

// Start server after DB connection
const port = process.env.QUIZ_PORT;

connectDB()
  .then(() => {
    quizService.listen(port, () => {
      console.log(`Learner server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

// Routes
quizService.use('/quizzes', quizRoutes);

// Health check route to test Weaviate connection
quizService.get('/test-connection', async (req, res) => {
  try {
    // Check Weaviate connection
    const result = await client.misc.readyChecker().do();
    res.status(200).json({ message: 'Weaviate connection successful', result });
  } catch (error) {
    res.status(500).json({ message: 'Weaviate connection failed', error: error.message });
  }
});
