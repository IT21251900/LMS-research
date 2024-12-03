import client from '../../configs/weaviateConfig.js';

export async function createQuizSchema() {
  try {
    const quizSchema = await client.schema.classCreator().withClass({
      class: "Quiz",  
      vectorizer: 'text2vec-openai', 
      moduleConfig: {
        'text2vec-openai': {
            model: 'ada',
            modelVersion: '002',
        }, 
        'generative-openai': {
            model: 'gpt-3.5-turbo', 
            // temperature: 0.7,        
            max_tokens: 500, 
        }, 
      },
      properties: [
        { name: "title", dataType: ["text"] },  
        { name: "contentId", dataType: ["text"] },  
        { name: "userID", dataType: ["text"] }, 
        { name: "difficultyLevel", dataType: ["number"] }, 
        { name: "question", dataType: ["text[]"] },  
        { name: "correctAnswer", dataType: ["text[]"] },  
      ]
    }).do();

    console.log(`Quiz Schema created: `, quizSchema);
  } catch (error) {
    console.error("Error creating schema: ", error);
  }
}
