import { generateShortQuiz } from '../services/shortQuizService.js';
import { storeQuizInWeaviate } from '../services/storeQuizInWeaviate.js';
import axios from 'axios';
import client from '../../configs/weaviateConfig.js';

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

// Get a single quiz by ID
export const getSAQuizById = async (req, res) => {
  const { id } = req.params;  

  try {
    const response = await client.graphql
      .get()
      .withClassName('Quiz')
      .withFields('title contentId difficultyLevel question correctAnswer')
      .withWhere({
        path: ['id'],
        operator: 'Equal',
        valueString: id, 
      })
      .do();

    if (!response || !response.data || response.data.Get.Quiz.length === 0) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    res.status(200).json({ quiz: response.data.Get.Quiz[0] });
  } catch (error) {
    console.error('Error fetching quiz:', error.message);
    res.status(500).json({ message: 'Failed to fetch quiz.', error: error.message });
  }
};

// Get all quizzes
export const getAllSAQuizzes = async (req, res) => {
  try {
    const response = await client.data.getter()
      .withClassName('Quiz')
      .do();

    if (!response || response.error) {
      return res.status(404).json({ message: 'No quizzes found.' });
    }

    res.status(200).json({ quizzes: response });
  } catch (error) {
    console.error('Error fetching quizzes:', error.message);
    res.status(500).json({ message: 'Failed to fetch quizzes.', error: error.message });
  }
};

// Validate user answers
export const validateSAQuizAnswers = async (req, res) => {
  const { quizId, answers } = req.body;

  // Validate input
  if (!quizId) {
    return res.status(400).json({ message: 'Quiz ID is required.' });
  }
  if (!answers || answers.length === 0) {
    return res.status(400).json({ message: 'Answers are required.' });
  }

  try {
    // Fetch the quiz from Weaviate by ID
    const quizResponse = await client.graphql
      .get()
      .withClassName('Quiz')
      .withFields('question correctAnswer')
      .withWhere({
        path: ['id'],
        operator: 'Equal',
        valueString: quizId,
      })
      .do();

    if (!quizResponse || !quizResponse.data || quizResponse.data.Get.Quiz.length === 0) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const quiz = quizResponse.data.Get.Quiz[0];

    // Validate each user answer using a hybrid query
    const results = await Promise.all(
      answers.map(async (userAnswer, index) => {
        const { question, answer } = userAnswer;

        // Perform hybrid search for the correct answer
        const searchResponse = await client.graphql
          .get()
          .withClassName('Quiz')
          .withFields('correctAnswer _additional { score }')
          .withHybrid({
            query: answer, // User's answer
            alpha: 0.75,   // Adjust for keyword vs semantic weighting
          })
          .withWhere({
            path: ['question'],
            operator: 'Equal',
            valueString: question,
          })
          .do();

        // Fetch the correct answer for the question
        const correctAnswer = quiz.correctAnswer[index];  

        // Normalize answers to lowercase for a case-insensitive comparison
        const normalizedUserAnswer = answer.trim().toLowerCase();
        const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

        let feedback = '';
        let isCorrect = false;

        // Check for exact match
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          feedback = "Correct!";
          isCorrect = true;
        } else {
          // Calculate hybrid score for the answer
          const hybridScore = searchResponse.data.Get.Quiz[0]._additional.score;

          // Adjusting logic based on hybrid score
          if (hybridScore > 0.9) {
            feedback = "Correct!";
            isCorrect = true;
          } else if (hybridScore > 0.75) {
            feedback = `Partially correct. Review the material for a better understanding. The correct answer is: ${correctAnswer}`;
          } else {
            feedback = `Incorrect. The correct answer is: ${correctAnswer}`;
          }
        }

        return {
          question,
          userAnswer: answer,
          hybridScore: searchResponse.data.Get.Quiz[0]._additional.score,
          isCorrect,
          feedback,
        };
      })
    );

    // Return the results
    res.status(200).json({ results });
  } catch (error) {
    console.error('Error validating answers:', error.message);
    res.status(500).json({ message: 'Failed to validate answers.', error: error.message });
  }
};
