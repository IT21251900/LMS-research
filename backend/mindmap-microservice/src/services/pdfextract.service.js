import PdfExtraction from "../schemes/pdfextract.scheme.js"

class PdfExtractService {
  // Method to save extracted data
  async savePdfData(pdfData) {
    try {
      const newPdfExtraction = new PdfExtraction(pdfData);
      await newPdfExtraction.save();

      console.log('PDF data saved successfully!');
      return newPdfExtraction;
    } catch (error) {
      console.error('Error saving PDF data:', error);
      throw error;
    }
  }
}

// Export the service as an ES module
export default new PdfExtractService();
