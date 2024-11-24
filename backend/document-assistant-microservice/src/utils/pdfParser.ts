import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export const extractTextFromPDF = async (pdfPath: string): Promise<string> => {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    
    // Join the text from all pages
    return docs.map(doc => doc.pageContent).join('\n');
};
