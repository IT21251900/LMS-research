// server.js
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { connectDB } from "../configs/DBConnect.js";

// Load environment variables
config();

export const mindmapService = express();

// Middleware
mindmapService.use(cookieParser());
mindmapService.use(cors());
mindmapService.use(express.json());

const port = process.env.MINDMAP_PORT;

// Start the server after connecting to the database
connectDB()
  .then(() => {
    mindmapService.listen(port, () => {
      console.log(`Learner server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

mindmapService.get("/", (req, res) => {
  console.log(`Received request to mind map server from gateway`);
  res.status(200).send("Response from mind map server");
});

// Use routes
