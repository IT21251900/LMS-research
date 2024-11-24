import { generateQuiz } from '../services/quizService.js'; 
import axios from 'axios';
import Quiz from '../schemes/Quiz.js';

export async function createQuiz(req, res) {
    const { contentId } = req.body;

    if (!contentId) {
        return res.status(400).json({ message: 'Content ID is required.' });
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
        const questions = await generateQuiz(contentData); 

        // Ensure questions are generated
        if (!questions || questions.length === 0) {
            return res.status(400).json({ message: 'No questions could be generated from the content.' });
        }

        // Create a new Quiz document
        const quiz = new Quiz({
            title: `Quiz for ${contentTitle}`,
            contentId,
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
