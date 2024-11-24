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
        Each question should have one correct answer and 3 incorrect options. Provide the questions in the format:
        
        Question: [Question text]
        Correct Answer: [Correct answer text]
        Other Answers: [Incorrect answer 1], [Incorrect answer 2], [Incorrect answer 3]

        Content:
        ${JSON.stringify(content)}

        output should be JSON fromat
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
        console.log(quizText);  
        return quizText;
    } catch (error) {
        console.error('Error generating quiz:', error.message);
        throw error;
    }
};
