import dotenv from "dotenv";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const env = process.env.NODE_ENV || "local"; 
dotenv.config({ path: `.env.${env}` });

const app = express();
const PORT = process.env.PORT || 8080;

// Proxy requests to user and order services
app.use(
  "/document-service",
  createProxyMiddleware({
    target: process.env.DOCUMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/document-service": "" },
  })
);


app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT} on ${env} environment`);
});
