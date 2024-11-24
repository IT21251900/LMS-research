import PdfExtraction from "../schemes/pdfextract.scheme.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class PdfExtractService {
  // Method to save extracted data
  // async savePdfData(pdfData) {
  //   try {
  //     const newPdfExtraction = new PdfExtraction(pdfData);
  //     await newPdfExtraction.save();

  //     console.log("PDF data saved successfully!");
  //     return newPdfExtraction;
  //   } catch (error) {
  //     console.error("Error saving PDF data:", error);
  //     throw error;
  //   }
  // }
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

  async getMindMapData(id) {
    try {
      // Fetch mind map data by ID
      const mindMapData = await PdfExtraction.findById(id);
      if (!mindMapData) {
        throw new Error("Mind map not found");
      }

      console.log("Mind map data retrieved successfully!");
      return mindMapData;
    } catch (error) {
      console.error("Error fetching mind map data:", error);
      throw error;
    }
  }
}

// Export the service as an ES module
export default new PdfExtractService();
