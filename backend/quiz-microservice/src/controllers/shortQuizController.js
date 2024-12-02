import { generateShortQuiz } from '../services/shortQuizService.js';
import { storeQuizInWeaviate } from '../services/storeQuizInWeaviate.js';
import axios from 'axios';

// Create Quiz: Generate quiz questions based on provided content
export const createSAQuiz = async (req, res) => {
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

  try {
    // Fetch the content data from an external service (e.g., mindmap-microservice)
    const response = await axios.get(`http://localhost:${process.env.MINDMAP_PORT}/lms/getPdfExtractedData/${contentId}`);

    const contentData = response.data;
    if (!contentData || !contentData.Sections || contentData.Sections.length === 0) {
      return res.status(400).json({ message: 'No valid content data found for the provided Content ID.' });
    }

    const contentTitle = contentData.Title || "Untitled Content";
    console.log('Content Title:', contentTitle);

    // Generate quiz questions using OpenAI model
    const questions = await generateShortQuiz(contentData, difficultyLevel);

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'No questions could be generated from the content.' });
    }

    // Store quiz in Weaviate
    await storeQuizInWeaviate({
      title: `Quiz for ${contentTitle}`,
      contentId,
      userID,                
      difficultyLevel,
      question: questions.map(q => q.question),  
      correctAnswer: questions.map(q => q.correctAnswer)
    });

    res.status(201).json({ message: 'Quiz created successfully.', quiz: questions });
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    res.status(500).json({ message: 'Failed to create quiz.', error: error.message });
  }


};
