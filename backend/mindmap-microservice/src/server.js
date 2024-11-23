// server.js
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import multer from 'multer';
import { connectDB } from "../configs/DBConnect.js";
import { extractPdfContent,processExtractedContent } from "./controllers/pdfextract.controller.js";

// Load environment variables
config();

export const mindmapService = express();

// Middleware
mindmapService.use(cookieParser());
mindmapService.use(cors());
mindmapService.use(express.json());

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });  // Set the temporary folder for uploads

// Start the server after connecting to the database
const port = process.env.MINDMAP_PORT;

connectDB()
  .then(() => {
    mindmapService.listen(port, () => {
      console.log(`Learner server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

// Route to handle file upload and PDF extraction
mindmapService.post("/lms/pdfExtract", upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const extractedData  = await extractPdfContent(req.file.path);
    res.status(200).json({
      message: 'PDF extraction and saving completed successfully.',
      data: extractedData, 
    });
    
  } catch (err) {
    console.error("Error during PDF extraction:", err);
    res.status(500).send('Error processing the PDF: ' + err.message);
  }
});


mindmapService.post("/lms/pdfcontentExtract", async (req, res) => {
  const filePath = req.body.jsonFilePath;

  if (!filePath) {
      return res.status(400).send("JSON file path is required.");
  }

  try {
      await processExtractedContent(filePath);
      res.status(200).send("Data successfully processed and saved to MongoDB.");
  } catch (error) {
      console.error("Error processing content:", error);
      res.status(500).send("Error processing content: " + error.message);
  }
});



// Basic route to check server health
mindmapService.get("/", (req, res) => {
  console.log(`Received request to mind map server from gateway`);
  res.status(200).send("Response from mind map server");
});
