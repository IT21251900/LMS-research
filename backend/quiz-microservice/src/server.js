import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { connectQuizDB } from '../configs/db.util.js';
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

connectQuizDB()
  .then(() => {
    quizService.listen(port, () => {
      console.log(`Quiz service running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start Quiz service:', err.message);
  });

// Routes
quizService.use('/api/quiz', quizRoutes);

// Health check
quizService.get('/', (req, res) => {
  res.status(200).send('Quiz microservice is up and running!');
});
