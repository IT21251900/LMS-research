import PdfExtraction from "../schemes/pdfextract.scheme.js";

class PdfExtractService {
  // Method to save extracted data
  async savePdfData(pdfData) {
    try {
      const newPdfExtraction = new PdfExtraction(pdfData);
      await newPdfExtraction.save();

      console.log("PDF data saved successfully!");
      return newPdfExtraction;
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
