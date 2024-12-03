import { generateQuiz } from '../services/mcqQuizService.js'; 
import axios from 'axios';
import Quiz from '../schemes/mcqQuizSchema.js';

export async function createQuiz(req, res) {
    const { contentId, userID, difficultyLevel } = req.body;

    // Validate required fields
    if (!contentId) {
        return res.status(400).json({ message: 'Content ID is required.' });
    }
    if (!userID) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    if (difficultyLevel === undefined || difficultyLevel === null) {
        return res.status(400).json({ message: 'Difficulty Level is required.' });
    }

    // Ensure difficultyLevel is a number between 0 and 100
    if (difficultyLevel < 0 || difficultyLevel > 100) {
        return res.status(400).json({ message: 'Difficulty Level must be between 0 and 100.' });
    }

    try {
        // Fetch the content data from the mindmap-microservice
        const response = await axios.get(`http://localhost:${process.env.MINDMAP_PORT}/lms/getPdfExtractedData/${contentId}`);

        // Ensure contentData is valid
        const contentData = response.data;
        if (!contentData || !contentData.Sections || contentData.Sections.length === 0) {
            return res.status(400).json({ message: 'No valid content data found for the provided Content ID.' });
        }

         // Extract title from the response data
         const contentTitle = contentData.Title || "" ;

         console.log('Content Title:', contentTitle);

        // Generate quiz questions using OpenAI model
        const questions = await generateQuiz(contentData, difficultyLevel); 

        // Ensure questions are generated
        if (!questions || questions.length === 0) {
            return res.status(400).json({ message: 'No questions could be generated from the content.' });
        }

        // Create a new Quiz document
        const quiz = new Quiz({
            title: `Quiz for ${contentTitle}`,
            contentId,
            userID,                
            difficultyLevel,
            questions,
        });

        // Save the quiz to the database
        await quiz.save();

        // Return success response with the quiz
        res.status(201).json({ message: 'Quiz created successfully.', quiz: questions });
    } catch (error) {
        console.error('Error creating quiz:', error.message);
        res.status(500).json({ message: 'Failed to create quiz.', error: error.message });
    }
}

export async function getAllQuizzes(req, res) {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json({ message: 'Quizzes retrieved successfully.', quizzes });
    } catch (error) {
        console.error('Error retrieving quizzes:', error.message);
        res.status(500).json({ message: 'Failed to retrieve quizzes.', error: error.message });
    }
}

export async function getQuizById(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Quiz ID is required.' });
    }

    try {
        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        res.status(200).json({ message: 'Quiz retrieved successfully.', quiz });
    } catch (error) {
        console.error('Error retrieving quiz:', error.message);
        res.status(500).json({ message: 'Failed to retrieve quiz.', error: error.message });
    }
}