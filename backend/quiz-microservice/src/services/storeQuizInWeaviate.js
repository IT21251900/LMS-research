import client from '../../configs/weaviateConfig.js';

// Store quiz in Weaviate
export const storeQuizInWeaviate = async (quiz) => {
    try {
        const response = await client.data.creator()
            .withClassName('Quiz')
            .withProperties({
                title: quiz.title,
                userID: quiz.userID,
                contentId: quiz.contentId,
                difficultyLevel: quiz.difficultyLevel,
                question: quiz.question,
                correctAnswer: quiz.correctAnswer,
            })
            .do();
        console.log('Quiz stored in Weaviate:', response);
    } catch (error) {
        console.error('Error storing quiz:', error);
        throw error;
    }
  };