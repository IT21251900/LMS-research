import client from '../../configs/weaviateConfig';  

async function createQuizSchema() {
  try {
    const quizSchema = await client.schema.classCreator().withClass({
      class: "Quiz",  
      vectorizer: 'text2vec-openai', 
      moduleConfig: {
        'text2vec-openai': {},
        'generative-openai': {}, 
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

await createQuizSchema();
