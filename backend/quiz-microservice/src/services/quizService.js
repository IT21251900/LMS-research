import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate quiz questions based on content
export const generateQuiz = async (content) => {
    const prompt = `
        You are a professional quiz generator. Based on the following content, create 3 multiple-choice quiz questions. 
        Each question should have one correct answer and 3 incorrect options. Provide the questions in valid JSON format:
        
        {
            "quiz_questions": [
                {
                    "Question": "Your question here",
                    "Correct Answer": "Correct answer here",
                    "Other Answers": ["Incorrect 1", "Incorrect 2", "Incorrect 3"]
                }
            ]
        }

        Content:
        ${JSON.stringify(content)}
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 3000,
            temperature: 1.0,
        });

        // Extract and return only the quiz text from the response
        const quizText = response.choices[0].message.content.trim();
        
        // Validate and parse JSON
        let quizData;
        try {
            quizData = JSON.parse(quizText);
            console.log('Raw Quiz Data from OpenAI:', JSON.stringify(quizData, null, 2));
        } catch (jsonError) {
            console.error('Invalid JSON from OpenAI:', quizText);
            throw new Error('OpenAI response was not valid JSON.');
        }

        // Validate structure
        if (!quizData || !quizData.quiz_questions || quizData.quiz_questions.length === 0) {
            throw new Error('Invalid or incomplete quiz data.');
        }

        const transformedQuestions = quizData.quiz_questions.map((q) => ({
            question: q.Question,
            correctAnswer: q['Correct Answer'],
            otherAnswers: q['Other Answers'],
        }));

        console.log('Transformed Questions:', transformedQuestions);

        return transformedQuestions;
    } catch (error) {
        console.error('Error generating quiz:', error.message);
        throw error;
    }
};
