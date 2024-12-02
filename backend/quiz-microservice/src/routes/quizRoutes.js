import express from 'express';
import { createQuiz, getQuizById, getAllQuizzes } from '../controllers/mcqQuizController.js';
import { createSAQuiz } from '../controllers/shortQuizController.js';

const router = express.Router();

//MCQ

router.post('/mcq/generate', createQuiz);

router.get('/mcq/:id', getQuizById);

router.get('/mcq', getAllQuizzes);


// Short Answer

router.post('/short-answers/create', createSAQuiz);  
// router.get('/short-answers', getAllQuizzes);   


export default router;
