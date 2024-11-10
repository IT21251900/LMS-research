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
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";
import fs from "fs";
import axios from "axios";

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
            clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
        });

        // Creates a PDF Services instance
        const pdfServices = new PDFServices({ credentials });

        // Creates an asset(s) from source file(s) and upload
        readStream = fs.createReadStream(inputFilePath);
        const inputAsset = await pdfServices.upload({
            readStream,
            mimeType: MimeType.PDF
        });

        // Create parameters for the job
        const params = new ExtractPDFParams({
            elementsToExtract: [ExtractElementType.TEXT]
        });

        // Creates a new job instance
        const job = new ExtractPDFJob({ inputAsset, params });

        // Submit the job and get the job result
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: ExtractPDFResult
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
            message: 'PDF extraction and saving completed successfully.',
            outputPath: outputFilePath
        };
    } catch (err) {
        if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
            console.log("Exception encountered while executing operation", err);
        } else {
            console.log("Exception encountered while executing operation", err);
        }
        throw err;  // Re-throw to handle in the calling function
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
    const dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
        ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
    fs.mkdirSync(filePath, { recursive: true });
    return (`${filePath}extract${dateString}.zip`);
}

const jsonFilePath = 'output/ExtractTextInfoFromPDF/structuredData.json';

async function categorizePDFContent(pdfElements) {
    try {
        const response = await axios.post('http://127.0.0.1:5000/categorize', pdfElements);
        return response.data;  // This will contain the structured content
    } catch (error) {
        console.error('Error categorizing PDF content:', error);
    }
}

// Load the JSON file and pass its content to categorizePDFContent
function loadAndCategorizeContent() {
    fs.readFile(jsonFilePath, 'utf-8', async (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        }

        try {
            const pdfElements = JSON.parse(data);  // Parse the JSON data
            const structuredContent = await categorizePDFContent(pdfElements);
            console.log('Structured Content:', structuredContent);
        } catch (parseError) {
            console.error('Error parsing JSON content:', parseError);
        }
    });
}

export {extractPdfContent,loadAndCategorizeContent} ;
