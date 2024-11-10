// pdfextract.js (Schema)
import mongoose, { Schema } from "mongoose";

const pdfExtractionSchema = new mongoose.Schema({
  elementText: { type: String, required: true },
  elementPath: { type: String, required: true },
});

const PdfExtraction = mongoose.model("PdfExtraction", pdfExtractionSchema);

export default PdfExtraction;
