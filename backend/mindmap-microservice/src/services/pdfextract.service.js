import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

class PdfExtractService {
  // Method to save extracted data
  async savePdfData(pdfData) {
    try {
      const mongoUri = process.env.MINDMAP_MONGO_URI;

      if (!mongoUri) {
        throw new Error("MongoDB URI is not defined in the environment variables.");
      }

      const client = await MongoClient.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const db = client.db(); 
      const collection = db.collection("Pdfextractions");
      const result = await collection.insertOne(pdfData);

      console.log("PDF data saved successfully!", result);
      client.close();
      return result;
    } catch (error) {
      console.error("Error saving PDF data:", error);
      throw error;
    }
  }

  // Method to fetch mind map data by ID
  async getMindMapData(id) {
    try {
      const mongoUri = process.env.MINDMAP_MONGO_URI;

      if (!mongoUri) {
        throw new Error("MongoDB URI is not defined in the environment variables.");
      }

      const client = await MongoClient.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const db = client.db(); 
      const collection = db.collection("Pdfextractions");

      // Convert id to ObjectId for querying
      const objectId = new ObjectId(id);
      const mindMapData = await collection.findOne({ _id: objectId });

      if (!mindMapData) {
        throw new Error("Mind map data not found");
      }

      console.log("Mind map data retrieved successfully!", mindMapData);
      client.close();
      return mindMapData;
    } catch (error) {
      console.error("Error fetching mind map data:", error);
      throw error;
    }
  }
}

// Export the service as an ES module
export default new PdfExtractService();
