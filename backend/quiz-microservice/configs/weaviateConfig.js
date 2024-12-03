import weaviate from 'weaviate-client';
import { config } from 'dotenv';

config();

const openaiApiKey = process.env.OPENAI_API_KEY;  

const client = weaviate.client({
  scheme: 'https',
  host: 'pjldwytlwvsamlwfoqfq.c0.asia-southeast1.gcp.weaviate.cloud',
  headers: {
    Authorization: `Bearer ${process.env.WEAVIATE_API_KEY}`,
    'X-OpenAI-Api-Key': openaiApiKey,  
  },
});

// Check Weaviate status
const checkWeaviateStatus = async () => {
  try {
    const response = await client.misc.readyChecker().do();
    console.log(response);
  } catch (error) {
    console.error('Error checking Weaviate status:', error);
  }
};

checkWeaviateStatus();

export default client;
