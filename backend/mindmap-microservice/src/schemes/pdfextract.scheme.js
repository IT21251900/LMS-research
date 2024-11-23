import mongoose from 'mongoose';

const pdfExtractionSchema = new mongoose.Schema(
  {
    Title: String,
    Sections: [
      {
        H1: String,
        Content: [
          {
            Paragraphs: String
          }
        ],
        SubSections: [
          {
            H2: String,
            Content: [
              {
                Paragraphs: String
              }
            ]
          }
        ]
      }
    ]
  }
);

const PdfExtraction = mongoose.model('PdfExtraction', pdfExtractionSchema);

export default PdfExtraction;
