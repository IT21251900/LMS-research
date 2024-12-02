import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate quiz questions based on content
export const generateShortQuiz = async (content, difficultyLevel) => {
    const prompt = `
        You are a professional quiz generator. Based on the following content, create 10 short-answer quiz questions in valid JSON format. 
        Each question must have one correct answer.

        The JSON format should look like this:
        {
            "difficultyLevel": ${difficultyLevel},
            "quiz_questions": [
                {
                    "question": "Your question here",
                    "correctAnswer": "Correct answer here"
                },
                ...
            ]
        }

        The difficulty level MUST be exactly ${difficultyLevel}. 
        - If the difficulty level is closer to 0, the questions should be easier and more straightforward.
        - If the difficulty level is closer to 100, the questions should be more complex, requiring deeper knowledge and critical thinking.

        Content:
        ${JSON.stringify(content)}
    `;  

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 3000,
            temperature: 0.7,
        });

        // Extract and return only the quiz text from the response
        const quizText = response.choices[0].message.content.trim();
        console.log("Raw Quiz Data from OpenAI:", quizText);

        // Validate and parse JSON
        const quizData = JSON.parse(quizText);
        console.log('Parsed OpenAI JSON:', JSON.stringify(quizData, null, 2));

        const transformedQuestions = quizData.quiz_questions.map((q) => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
        }));
           
        console.log('Transformed Questions:', transformedQuestions);     

        return transformedQuestions;
    } catch (error) {
        console.error('Error generating quiz:', error.message);
        throw error;
    }
};