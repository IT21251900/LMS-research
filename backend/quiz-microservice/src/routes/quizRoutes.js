import express from 'express';
import { createQuiz, getQuizById, getAllQuizzes } from '../controllers/quizController.js';

const router = express.Router();

// Endpoint to generate a quiz
router.post('/generate', createQuiz);

// Endpoint to fetch a quiz by ID
router.get('/:id', getQuizById);

// Endpoint to fetch all quizzes
router.get('/', getAllQuizzes);

export default router;
