import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExtractPDFParams,
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
} from "@adobe/pdfservices-node-sdk";
import fs from "fs";
import { OpenAI } from "openai";
import pdfExtractService from "../services/pdfextract.service.js";

const openai = new OpenAI({
  apiKey:
    "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",
});
/**
 * Extracts text content from a PDF using Adobe PDF Services SDK
 * @param {string} inputFilePath - Path to the PDF file to extract content from
 * @returns {Promise<object>} - Extracted PDF content
 */
async function extractPdfContent(inputFilePath) {
  let readStream;
  try {
    // Initial setup, create credentials instance
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Creates an asset(s) from source file(s) and upload
    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF,
    });

    // Create parameters for the job
    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT],
    });

    // Creates a new job instance
    const job = new ExtractPDFJob({ inputAsset, params });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult,
    });

    // Get content from the resulting asset(s)
    const resultAsset = pdfServicesResponse.result.resource;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Generate output file path and save the result
    const outputFilePath = createOutputFilePath();
    console.log(`Saving asset at ${outputFilePath}`);

    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);

    return {
      message: "PDF extraction and saving completed successfully.",
      outputPath: outputFilePath,
    };
  } catch (err) {
    if (
      err instanceof SDKError ||
      err instanceof ServiceUsageError ||
      err instanceof ServiceApiError
    ) {
      console.log("Exception encountered while executing operation", err);
    } else {
      console.log("Exception encountered while executing operation", err);
    }
    throw err; // Re-throw to handle in the calling function
  } finally {
    readStream?.destroy();
  }
}

/**
 * Generates a string containing a directory structure and file name for the output file
 * @returns {string} - The file path for the saved output file
 */
function createOutputFilePath() {
  const filePath = "output/ExtractTextInfoFromPDF/";
  const date = new Date();
  const dateString =
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2) +
    "T" +
    ("0" + date.getHours()).slice(-2) +
    "-" +
    ("0" + date.getMinutes()).slice(-2) +
    "-" +
    ("0" + date.getSeconds()).slice(-2);
  fs.mkdirSync(filePath, { recursive: true });
  return `${filePath}extract${dateString}.zip`;
}

async function processExtractedContent(extractedFilePath) {
  try {
    const rawData = fs.readFileSync(extractedFilePath, "utf8");
    const extractedContent = JSON.parse(rawData);

    const contentArray = extractedContent.elements;

    if (!Array.isArray(contentArray)) {
      throw new Error(
        "Extracted content is not an array. Check the 'elements' field in the JSON file."
      );
    }

    // Filter relevant data
    const texts = contentArray.map((item) => ({
      text: item.Text,
      Path: item.Path,
      Page: item.Page,
    }));

    // Process and save the data
    // const structuredData = await structureContentWithGPT(texts);
    // console.log(structuredData);
    // console.log(typeof structuredData);

    const structuredData = [
        '```json\n' +
          '{\n' +
          '    "Title": "Networking: An Overview",\n' +
          '    "Sections": [\n' +
          '        {\n' +
          '            "H1": "1. Introduction to Networking",\n' +
          '            "Content": [\n' +
          '                {\n' +
          '                    "Paragraphs": "Networking is the practice of connecting computers and other devices to share resources and information. A computer network allows devices to communicate with each other, exchange data, and access the internet. The fundamental goal of networking is to enable communication between different systems."\n' +
          '                }\n' +
          '            ],\n' +
          '            "SubSections": []\n' +
          '        },\n' +
          '        {\n' +
          '            "H1": "2. Types of Networks",\n' +
          '            "Content": [],\n' +
          '            "SubSections": [\n' +
          '                {\n' +
          '                    "H2": "2.1 Local Area Network (LAN)",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "A Local Area Network (LAN) is a network of computers and devices connected within a small geographical area, such as a single building or a campus. It allows for high-speed data transfer and resource sharing, such as file sharing and printing."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                },\n' +
          '                {\n' +
          '                    "H2": "2.2 Wide Area Network (WAN)",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "A Wide Area Network (WAN) connects multiple LANs over a larger geographical area, such as between cities, countries, or continents. WANs use technologies like leased lines and satellite communication to transmit data over long distances."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                }\n' +
          '            ]\n' +
          '        },\n' +
          '        {\n' +
          '            "H1": "3. Network Protocols",\n' +
          '            "Content": [],\n' +
          '            "SubSections": [\n' +
          '                {\n' +
          '                    "H2": "3.1 Transmission Control Protocol/Internet Protocol (TCP/IP)",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "TCP/IP is the fundamental protocol used for communication over the internet. It defines how data is transmitted between devices, ensuring reliable delivery of information through packet-switching."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                },\n' +
          '                {\n' +
          '                    "H2": "3.2 HyperText Transfer Protocol (HTTP)",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "HTTP is a protocol used for transmitting hypertext (web pages) across the internet. It is the foundation of data exchange on the World Wide Web, allowing users to access websites through web browsers."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                }\n' +
          '            ]\n' +
          '        },\n' +
          '        {\n' +
          '            "H1": "4. Network Security",\n' +
          '            "Content": [],\n' +
          '            "SubSections": [\n' +
          '                {\n' +
          '                    "H2": "4.1 Firewalls",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "A firewall is a security system designed to protect a network from unauthorized access and threats. It can be implemented in both hardware and software and monitors incoming and outgoing network traffic."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                },\n' +
          '                {\n' +
          '                    "H2": "4.2 Encryption",\n' +
          '                    "Content": [\n' +
          '                        {\n' +
          '                            "Paragraphs": "Encryption is the process of converting data into a code to prevent unauthorized access. In networking, encryption ensures that data transmitted over networks remains confidential and secure."\n' +
          '                        }\n' +
          '                    ]\n' +
          '                }\n' +
          '            ]\n' +
          '        }\n' +
          '    ]\n' +
          '}\n' +
          '```'
      ];
      
      // Access the first element of the array (which is a string) and remove unwanted characters
      let structuredDataString = structuredData[0].replace(/```json\n|\n```/g, '');
      
      // Now parse the cleaned string into a JSON object
      try {
        const jsonData = JSON.parse(structuredDataString);
        console.log(JSON.stringify(jsonData, null, 2)); 
        saveContentToDatabase(jsonData)
        return jsonData;
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
      
    // console.log("Data successfully structured and saved to MongoDB.");
  } catch (error) {
    console.error("Error processing content:", error);
    throw error; // Rethrow for external handling
  }
}

function chunkText(texts, maxTokens = 3000) {
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const text of texts) {
    const textLength = JSON.stringify(text).length;

    if (currentLength + textLength > maxTokens) {
      chunks.push(currentChunk);
      currentChunk = [text];
      currentLength = textLength;
    } else {
      currentChunk.push(text);
      currentLength += textLength;
    }
  }

  // Push the last chunk if any content is left
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function structureContentWithGPT(texts) {
  // Chunk the texts into manageable pieces (assuming chunkText is defined)
  const textChunks = chunkText(texts, 3000);
  console.log("Here are the chunks", textChunks);

  let structuredContent = [];

  // Loop over each chunk of text
  for (const chunk of textChunks) {
    // Filter out any items where 'text' is undefined or null
    const filteredChunk = chunk.filter((item) => item.text != null);

    if (filteredChunk.length > 0) {
      // Construct the prompt for GPT
      const prompt = `
    I have the following extracted content from a PDF. Each element contains a text field, path, and a page number.
    Group the content into a hierarchical JSON structure with H1, H2, H3 headings, and paragraphs.
    Keep related text under the appropriate headings based on semantic context.
    Under H1, include the relevant H2 tags; under H2, include their paragraph contents.
    For each section, use the following format:
    - Title: String
    - Sections: 
        - H1: String
            - Content: [ 
                - Paragraphs: String
            ]
            - SubSections: 
                - H2: String
                    - Content: [
                        - Paragraphs: String
                    ]
    Please analyze the page numbers and identify the sequential order.
    Only include valid elements where text is available. Ensure that headings and paragraphs are well grouped by their context.
    Return the JSON structure only, with no additional text. The response should be in a format that can be saved directly into the database.

    Here is the extracted data:
    ${JSON.stringify(filteredChunk)}
`;

      try {
        // Call GPT API with the prompt
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000,
          temperature: 1.0,
        });

        const responseData = response.choices[0].message.content.trim();

          structuredContent.push(responseData);
          console.error("Received response:", responseData);
        
      } catch (error) {
        console.error("Error structuring content with GPT:", error);
      }
    }
  }

  return structuredContent;
}

async function extractJsonObject(structuredData) {
    try {
        // Extract the JSON string part from the input
        const jsonString = structuredData.match(/```json\n([\s\S]*?)\n```/)[1];

        // Parse the JSON string into a JavaScript object
        const jsonObject = JSON.parse(jsonString);

        return jsonObject;
    } catch (error) {
        console.error("Error extracting JSON object:", error);
        throw new Error("Invalid JSON structure or format in the input data.");
    }
}


async function saveContentToDatabase(contentData) {
    try {
      // Check if the contentData is a string, then parse it
      let jsonData = contentData;
  
      // If it's a string, try parsing it
      if (typeof contentData === 'string') {
        jsonData = JSON.parse(contentData);  // Parse the string into an object
      }
  
      console.log('Parsed JSON Data:', JSON.stringify(jsonData, null, 2));
  
      // Save the parsed data to the database
      const savedData = await pdfExtractService.savePdfData(jsonData);  // Ensure savePdfData is called correctly
  
      // Optionally log the saved data or handle it further
      console.log('Data saved:', savedData);
  
      return savedData;  // Returning saved data, or you could return a success message
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;  // Propagate the error if needed
    }
  }
  

export { extractPdfContent, processExtractedContent };
