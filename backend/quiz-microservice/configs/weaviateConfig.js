import weaviate from 'weaviate-client';
import { config } from 'dotenv';

config();

const client = weaviate.client({
  scheme: 'https',
  host: 'pjldwytlwvsamlwfoqfq.c0.asia-southeast1.gcp.weaviate.cloud', 
  headers: {
    Authorization: `Bearer ${process.env.WEAVIATE_API_KEY}`, 
  },
});

// console.log('Weaviate API Key:', process.env.WEAVIATE_API_KEY);

// Check if Weaviate is ready
const checkWeaviateStatus = async () => {
    try {
      const response = await client.misc
        .readyChecker()
        .do();
      console.log(response);
    } catch (error) {
      console.error('Error checking Weaviate status:', error);
    }
  };
  
  // Call the function to check Weaviate status
  checkWeaviateStatus();

export default client;



