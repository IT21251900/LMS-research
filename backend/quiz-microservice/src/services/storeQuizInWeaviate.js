import client from '../../configs/weaviateConfig.js';

// Store quiz in Weaviate
export const storeQuizInWeaviate = async (quiz) => {
    try {
        const response = await client.data.creator()
            .withClassName('Quiz')
            .withProperties({
                title: quiz.title,
                // userID: quiz.userID,
                // contentId: quiz.contentId,
                difficultyLevel: quiz.difficultyLevel,
                question: quiz.question,
                correctAnswer: quiz.correctAnswer,
            })
            .do();
        console.log('Quiz stored in Weaviate:', response);

        // Extract the quiz id from the response
        const quizId = response.id;  

        if (quizId) {
            return {
                message: 'Quiz created successfully.',
                quiz: {
                    id: quizId,  
                    title: quiz.title,
                    difficultyLevel: quiz.difficultyLevel,
                    question: quiz.question,
                    correctAnswer: quiz.correctAnswer,
                }
            };
        } else {
            throw new Error('Quiz ID not found in the response.');
        }

    } catch (error) {
        console.error('Error storing quiz:', error);
        throw error;
    }
  };