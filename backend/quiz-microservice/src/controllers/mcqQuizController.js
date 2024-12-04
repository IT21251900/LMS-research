import { generateQuiz } from '../services/mcqQuizService.js'; 
import axios from 'axios';
import Quiz from '../schemes/mcqQuizSchema.js';

export async function createQuiz(req, res) {
    const { userID, difficultyLevel } = req.body;

    // Validate required fields
    // if (!contentId) {
    //     return res.status(400).json({ message: 'Content ID is required.' });
    // }
    // if (!userID) {
    //     return res.status(400).json({ message: 'User ID is required.' });
    // }

    // Set default difficulty level if not provided
    const resolvedDifficultyLevel = 
        difficultyLevel !== undefined && difficultyLevel !== null 
            ? difficultyLevel 
            : 50;

    // Ensure difficultyLevel is within the valid range
    if (resolvedDifficultyLevel < 0 || resolvedDifficultyLevel > 100) {
        return res.status(400).json({ message: 'Difficulty Level must be between 0 and 100.' });
    }

    try {
        // Fetch the extracted elements from the new endpoint
        const response = await axios.get(`http://localhost:${process.env.MINDMAP_PORT}/lms/pdfcontentExtractElements`);

        // Ensure response data is valid
        const extractedElements = response.data;
        if (!extractedElements || extractedElements.length === 0) {
            return res.status(400).json({ message: 'No valid content data found.' });
        }

        // Combine the text of all extracted elements
        const combinedContent = extractedElements
            .map(element => element.text.trim()) // Extract text only
            .filter(text => text) // Exclude empty or undefined text
            .join('\n'); // Combine into a single string

        // Generate quiz questions using OpenAI model
        const { title, questions } = await generateQuiz({ content: combinedContent }, resolvedDifficultyLevel);

        // Ensure questions are generated
        if (!questions || questions.length === 0) {
            return res.status(400).json({ message: 'No questions could be generated from the content.' });
        }

        // Create a new Quiz document
        const quiz = new Quiz({
            title,
            // contentId,
            userID,
            difficultyLevel: resolvedDifficultyLevel,
            questions,
        });

        // Save the quiz to the database
        const savedQuiz = await quiz.save();

        // Return success response with the quiz
        // res.status(201).json({ message: 'Quiz created successfully.', quiz: questions });
        res.status(201).json({ 
            message: 'Quiz created successfully.',
            quiz: {
                id: savedQuiz._id,
                title: savedQuiz.title,
                difficultyLevel: savedQuiz.difficultyLevel,
                questions: savedQuiz.questions,
            },
        });
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