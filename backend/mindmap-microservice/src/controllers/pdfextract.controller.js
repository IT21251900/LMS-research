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
import PdfExtraction from "../schemes/pdfextract.scheme.js";
import path from 'path';
import AdmZip from 'adm-zip'
import unzipper from 'unzipper'; 
import axios from 'axios';
const dirPath = "output/ExtractTextInfoFromPDF/"

const openai = new OpenAI({
  apiKey:
    "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",
});
/**
 * Extracts text content from a PDF using Adobe PDF Services SDK
 * @param {string} inputFilePath - Path to the PDF file to extract content from
 * @returns {Promise<object>} - Extracted PDF content
 */
// async function extractPdfContent(inputFilePath) {
//   let readStream;
//   try {
//     // Initial setup, create credentials instance
//     const credentials = new ServicePrincipalCredentials({
//       clientId: process.env.PDF_SERVICES_CLIENT_ID,
//       clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,
//     });

//     // Creates a PDF Services instance
//     const pdfServices = new PDFServices({ credentials });

//     // Creates an asset(s) from source file(s) and upload
//     readStream = fs.createReadStream(inputFilePath);
//     const inputAsset = await pdfServices.upload({
//       readStream,
//       mimeType: MimeType.PDF,
//     });

//     // Create parameters for the job
//     const params = new ExtractPDFParams({
//       elementsToExtract: [ExtractElementType.TEXT],
//     });

//     // Creates a new job instance
//     const job = new ExtractPDFJob({ inputAsset, params });

//     // Submit the job and get the job result
//     const pollingURL = await pdfServices.submit({ job });
//     const pdfServicesResponse = await pdfServices.getJobResult({
//       pollingURL,
//       resultType: ExtractPDFResult,
//     });

//     // Get content from the resulting asset(s)
//     const resultAsset = pdfServicesResponse.result.resource;
//     const streamAsset = await pdfServices.getContent({ asset: resultAsset });

//     // Generate output file path and save the result
//     const outputFilePath = createOutputFilePath();
//     console.log(`Saving asset at ${outputFilePath}`);

//     const writeStream = fs.createWriteStream(outputFilePath);
//     streamAsset.readStream.pipe(writeStream);

//     await extractLatestZipFileToFolder();
//     return {
//       message: "PDF extraction and saving completed successfully.",
//       outputPath: outputFilePath,
//     };
//   } catch (err) {
//     if (
//       err instanceof SDKError ||
//       err instanceof ServiceUsageError ||
//       err instanceof ServiceApiError
//     ) {
//       console.log("Exception encountered while executing operation", err);
//     } else {
//       console.log("Exception encountered while executing operation", err);
//     }
//     throw err; // Re-throw to handle in the calling function
//   } finally {
//     readStream?.destroy();
//   }
// }

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

      // Creates an asset from the source file and upload
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

      // Wait for the writeStream to finish writing before extracting the latest zip
      await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
      });

      // Extract the latest zip file
      await extractLatestZipFileToFolder();

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
  const basePath = "output/ExtractTextInfoFromPDF/";
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

  const directoryPath = `${basePath}`;
  fs.mkdirSync(directoryPath, { recursive: true }); 
  return `${directoryPath}extract-${dateString}.zip`;
}

/**
 * Gets the latest zip file from the specified directory
 * @returns {string} - The path of the latest zip file
 */
async function extractLatestZipFileToFolder() {
  const dirPath = "output/ExtractTextInfoFromPDF/";
  const files = fs.readdirSync(dirPath);
  const zipFiles = files.filter(file => file.endsWith(".zip"));

  if (zipFiles.length === 0) {
      console.log('No ZIP files found.');
      return; // Exit the function if no ZIP files are found
  }

  let latestZipFile = null;
  let latestMtime = 0;

  for (const file of zipFiles) {
      const filePath = path.join(dirPath, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.mtime > latestMtime) {
          latestMtime = fileStats.mtime;
          latestZipFile = filePath;
      }
  }

  if (latestZipFile) {
      const zip = new AdmZip(latestZipFile);
      const outputDir = path.join(dirPath, path.basename(latestZipFile, '.zip'));

      fs.mkdirSync(outputDir, { recursive: true });

      zip.extractAllTo(outputDir, true);

      console.log(`Extracted files to: ${outputDir}`);
  }
}


async function getLatestExtractedFolder() {
  const dirPath = "output/ExtractTextInfoFromPDF/";
  const folders = fs.readdirSync(dirPath).filter(file => {
      const filePath = path.join(dirPath, file);
      return fs.statSync(filePath).isDirectory(); 
  });

  if (folders.length === 0) {
      console.log('No extracted folders found.');
      return null; 
  }

  let latestFolder = null;
  let latestMtime = 0;

  for (const folder of folders) {
      const folderPath = path.join(dirPath, folder);
      const folderStats = fs.statSync(folderPath);

      if (folderStats.mtime > latestMtime) {
          latestMtime = folderStats.mtime;
          latestFolder = folderPath;
      }
  }

  if (latestFolder) {
      const structuredDataPath = path.join(latestFolder, 'structuredData.json');
      return structuredDataPath.split(path.sep).join('/');
  }

  return null; 
}

async function getExtractedElements(filePathJson) {
  const rawData = fs.readFileSync(filePathJson, "utf8");
  const extractedContent = JSON.parse(rawData);
  
  if (extractedContent.elements) {
      return extractedContent.elements.map(element => element.Text).filter(text => text);
  } else {
      throw new Error("No elements found in the extracted content.");
  }
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
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "1.1 What is Networking?",\n' +
        '      "Content": [\n' +
        '        "Networking is the process of connecting multiple devices, such as computers, printers, and servers, to enable communication, resource sharing, and data exchange. These connections can be wired (using cables) or wireless (using electromagnetic waves). Networking forms the backbone of modern technology, supporting systems ranging from simple home setups to complex global infrastructures. It allows devices to share resources efficiently, such as internet connections, storage, and processing power.",\n' +
        '        "For example, a home network connects personal computers, smartphones, and smart TVs to a single internet source, while corporate networks link offices worldwide for seamless collaboration."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "1.1.1 Examples of Networking",\n' +
        '          "Content": [\n' +
        '            "Networking is embedded in various aspects of daily life and organizational systems, improving efficiency and connectivity. Examples include:",\n' +
        '            "Networking simplifies operations, enhances convenience, and supports real-time interactions across diverse platforms."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "1.1.1.1 Banking Systems",\n' +
        '              "Content": [\n' +
        '                "Networking plays a critical role in banking, connecting branches, ATMs, and online platforms to provide integrated services. Modern banking systems depend on robust networks to enable:"\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "",\n' +
        '                  "Content": [\n' +
        '                    "• Personal Devices: Smartphones, laptops, and tablets connect to the internet or each other through Wi-Fi or Bluetooth for sharing files, streaming media, or online communication.",\n' +
        '                    "• Corporate Systems: Offices use Local Area Networks (LANs) for secure data sharing, employee collaboration, and accessing shared printers or drives.",\n' +
        '                    "• Public Services: Governments rely on networks to maintain databases for public records, such as tax systems, and to enable online services like license renewals or bill payments.",\n' +
        '                    "• Inter-branch Connectivity: Branches are linked to central servers, allowing customers to access their accounts from any location.",\n' +
        '                    "• ATM Networks: ATMs use secure networking protocols to interact with banking servers, facilitating withdrawals, deposits, and balance inquiries."\n' +
        "                  ]\n" +
        "                }\n" +
        "              ]\n" +
        "            }\n" +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "```"
    ];

    // Access the first element of the array (which is a string) and remove unwanted characters
    let structuredDataString = [];

    // Clean and merge the JSON strings into one single string
    for (let i = 0; i < structuredData.length; i++) {
      structuredDataString[i] = structuredData[i].replace(
        /```json\n|\n```/g,
        ""
      );
    }

    // Combine the cleaned strings into a single JSON object
    let combinedDataString = `{
  "Title": "Combined Extracted PDF Content",
  "Sections": [
    ${structuredDataString.join(",")}
  ]
}`;

    try {
      const jsonData = JSON.parse(combinedDataString);
      // console.log(JSON.stringify(jsonData, null, 2));

      const savedData = await saveContentToDatabase(jsonData); 

      if (savedData && savedData.insertedId) {
        const id = savedData.insertedId.toString();
        const fetchedData = await getMindMapController(id);

        // console.log("Fetched data:", JSON.stringify(fetchedData, null, 2));
        return fetchedData; 
      } else {
        throw new Error("Failed to retrieve ID from saved data");
      }
  } catch (error) {
      console.error("Error parsing JSON:", error);
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
    Group the content into a hierarchical JSON structure with H1, H2, H3, H4, H5, H6 headings, and paragraphs.
    Keep related text under the appropriate headings based on semantic context.
    For each section, use the following format.you have to replace the title with mapping title with our chunks:
    {
  "Title": "Extracted PDF Content",
  "Sections": [
    {
      "H1": "Chapter 1",
      "Content": [
        "Introduction to the topic."
      ],
      "SubSections": [
        {
          "H2": "Section 1.1",
          "Content": [
            "Details about section 1.1."
          ],
          "SubSections": [
            {
              "H3": "Subsection 1.1.1",
              "Content": [
                "Details about subsection 1.1.1."
              ]
            }
          ]
        },
        {
          "H2": "Section 1.2",
          "Content": [
            "Details about section 1.2."
          ]
        }
      ]
    },
    {
      "H1": "Chapter 2",
      "Content": [
        "Introduction to chapter 2."
      ],
      "SubSections": [
        {
          "H2": "Section 2.1",
          "Content": [
            "Details about section 2.1."
          ],
          "SubSections": [
            {
              "H3": "Subsection 2.1.1",
              "Content": [
                "Details about subsection 2.1.1."
              ],
              "SubSections": [
                {
                  "H4": "Sub-subsection 2.1.1.1",
                  "Content": [
                    "Details about sub-subsection 2.1.1.1."
                  ]
                }
              ]
            }
          ]
        },
        {
          "H2": "Section 2.2",
          "Content": [
            "Details about section 2.2."
          ]
        }
      ]
    }
  ]
}

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
    const jsonString = structuredData.match(/```json\n([\s\S]*?)\n```/)[1];

    const jsonObject = JSON.parse(jsonString);

    return jsonObject;
  } catch (error) {
    console.error("Error extracting JSON object:", error);
    throw new Error("Invalid JSON structure or format in the input data.");
  }
}

async function saveContentToDatabase(contentData) {
  try {
    let jsonData = contentData;

    // If it's a string, try parsing it
    if (typeof contentData === "string") {
      jsonData = JSON.parse(contentData); 
    }

    // console.log("Parsed JSON Data:", JSON.stringify(jsonData, null, 2));

    const savedData = await pdfExtractService.savePdfData(jsonData); 

    console.log("Data saved:", savedData);

    return savedData; 
  } catch (error) {
    console.error("Error saving content:", error);
    throw error; 
  }
}

async function getMindMapController(id) {
  try {
    if (!id) {
      throw new Error("ID is required to fetch mind map data");
    }
    const mindMapData = await pdfExtractService.getMindMapData(id);

    if (!mindMapData) {
      throw new Error("No mind map data found for the provided ID");
    }

    // console.log("Mind map data retrieved:", mindMapData);
    return mindMapData;
  } catch (error) {
    console.error("Error in getMindMapController:", error.message);
    throw error; 
  }
}

export { extractPdfContent, processExtractedContent, getMindMapController, getLatestExtractedFolder,getExtractedElements };
