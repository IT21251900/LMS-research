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

    // const structuredData = [
    //   "```json\n" +
    //     "{\n" +
    //     '    "Title": "Networking: An Overview",\n' +
    //     '    "Sections": [\n' +
    //     "        {\n" +
    //     '            "H1": "1. Introduction to Networking",\n' +
    //     '            "Content": [\n' +
    //     "                {\n" +
    //     '                    "Paragraphs": "Networking is the practice of connecting computers and other devices to share resources and information. A computer network allows devices to communicate with each other, exchange data, and access the internet. The fundamental goal of networking is to enable communication between different systems."\n' +
    //     "                }\n" +
    //     "            ],\n" +
    //     '            "SubSections": []\n' +
    //     "        },\n" +
    //     "        {\n" +
    //     '            "H1": "2. Types of Networks",\n' +
    //     '            "Content": [],\n' +
    //     '            "SubSections": [\n' +
    //     "                {\n" +
    //     '                    "H2": "2.1 Local Area Network (LAN)",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "A Local Area Network (LAN) is a network of computers and devices connected within a small geographical area, such as a single building or a campus. It allows for high-speed data transfer and resource sharing, such as file sharing and printing."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                },\n" +
    //     "                {\n" +
    //     '                    "H2": "2.2 Wide Area Network (WAN)",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "A Wide Area Network (WAN) connects multiple LANs over a larger geographical area, such as between cities, countries, or continents. WANs use technologies like leased lines and satellite communication to transmit data over long distances."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                }\n" +
    //     "            ]\n" +
    //     "        },\n" +
    //     "        {\n" +
    //     '            "H1": "3. Network Protocols",\n' +
    //     '            "Content": [],\n' +
    //     '            "SubSections": [\n' +
    //     "                {\n" +
    //     '                    "H2": "3.1 Transmission Control Protocol/Internet Protocol (TCP/IP)",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "TCP/IP is the fundamental protocol used for communication over the internet. It defines how data is transmitted between devices, ensuring reliable delivery of information through packet-switching."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                },\n" +
    //     "                {\n" +
    //     '                    "H2": "3.2 HyperText Transfer Protocol (HTTP)",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "HTTP is a protocol used for transmitting hypertext (web pages) across the internet. It is the foundation of data exchange on the World Wide Web, allowing users to access websites through web browsers."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                }\n" +
    //     "            ]\n" +
    //     "        },\n" +
    //     "        {\n" +
    //     '            "H1": "4. Network Security",\n' +
    //     '            "Content": [],\n' +
    //     '            "SubSections": [\n' +
    //     "                {\n" +
    //     '                    "H2": "4.1 Firewalls",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "A firewall is a security system designed to protect a network from unauthorized access and threats. It can be implemented in both hardware and software and monitors incoming and outgoing network traffic."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                },\n" +
    //     "                {\n" +
    //     '                    "H2": "4.2 Encryption",\n' +
    //     '                    "Content": [\n' +
    //     "                        {\n" +
    //     '                            "Paragraphs": "Encryption is the process of converting data into a code to prevent unauthorized access. In networking, encryption ensures that data transmitted over networks remains confidential and secure."\n' +
    //     "                        }\n" +
    //     "                    ]\n" +
    //     "                }\n" +
    //     "            ]\n" +
    //     "        }\n" +
    //     "    ]\n" +
    //     "}\n" +
    //     "```",
    // ];

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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Chapter 1",\n' +
        '      "Content": [\n' +
        '        "By interlinking operations, networking ensures that banking services are available 24/7, fostering customer trust and operational reliability."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "1.1.1.1.1 Online Transactions",\n' +
        '          "Content": [\n' +
        '            "Networking enables secure and instant online transactions by connecting users to financial institutions through encrypted systems. Examples include:",\n' +
        '            "Fund Transfers: Real-time processing of transactions via services like NEFT, RTGS, or mobile wallets.",\n' +
        '            "Payments: Customers can pay bills, shop online, or book tickets securely using platforms integrated with their bank accounts.",\n' +
        '            "Fraud Detection: Advanced networking supports AI systems that monitor transactions for suspicious activities, ensuring security.",\n' +
        '            "This seamless connectivity empowers users to manage their finances conveniently and securely, without visiting a bank branch."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "1.1.1.1.1.1 Real-Time Systems",\n' +
        '              "Content": [\n' +
        '                "Real-time systems are essential in modern networking to support instant processing and responses without delays. These systems ensure:",\n' +
        '                "Immediate Data Processing: Transactions, updates, and responses occur in milliseconds, providing a smooth user experience.",\n' +
        '                "High Availability: Real-time systems operate continuously, minimizing downtime and interruptions.",\n' +
        '                "Error Reduction: Automated systems reduce manual errors, improving reliability and accuracy.",\n' +
        '                "Examples include instant messaging applications, stock market trading platforms, and emergency services dispatch systems, all of which rely on real-time networking to function effectively."\n' +
        "              ]\n" +
        "            }\n" +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    },\n" +
        "    {\n" +
        '      "H1": "1.2 Key Benefits of Networking",\n' +
        '      "Content": [],\n' +
        '      "SubSections": []\n' +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Chapter 1",\n' +
        '      "Content": [\n' +
        `        "Networking is essential in today's interconnected world due to the numerous advantages it offers. By enabling communication, resource sharing, and centralized management, networking helps both individuals and organizations achieve greater efficiency, reduce costs, and improve collaboration. Whether in a home, office, or global organization, networking provides a robust foundation for seamless interaction and operation."\n` +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "1.2.1 Resource Sharing",\n' +
        '          "Content": [\n' +
        '            "One of the most significant benefits of networking is its ability to facilitate resource sharing. Networking enables multiple users or devices to access shared resources like printers, file servers, and applications, which reduces redundancy and improves efficiency. For instance, in an office network, employees can access shared software applications from their computers, eliminating the need for individual licenses for each user. This approach saves money, simplifies management, and enhances productivity."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "1.2.1.1 Printers",\n' +
        '              "Content": [\n' +
        '                "Networking allows a single printer to be shared among multiple users, making it cost-effective and convenient. Instead of equipping each desk with a printer, a networked printer can serve an entire office floor."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "Benefits of Networked Printers",\n' +
        '                  "Content": [\n' +
        '                    "Efficient Usage: A networked printer ensures optimized usage by queuing print jobs efficiently.",\n' +
        '                    "Accessibility: Employees across different rooms or floors can send print requests without being physically near the printer.",\n' +
        '                    "Cost-Effective Maintenance: Networking reduces the need for multiple devices, lowering maintenance and operational costs."\n' +
        "                  ]\n" +
        "                }\n" +
        "              ]\n" +
        "            },\n" +
        "            {\n" +
        '              "H3": "1.2.1.1.1 File Servers",\n' +
        '              "Content": [\n' +
        '                "File servers in a network allow centralized storage and easy access to files for all authorized users. This eliminates the need for redundant copies of files and ensures everyone works on the most up-to-date version."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "Benefits of File Servers",\n' +
        '                  "Content": [\n' +
        '                    "Centralized Storage: All critical data resides in one location, making it easier to manage backups and security.",\n' +
        '                    "Collaboration: Teams can work collaboratively by accessing shared files without emailing multiple versions."\n' +
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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "1.2 Cost Savings",\n' +
        '      "Content": [],\n' +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H5": "1.2.1.1.1.1 Cost Savings",\n' +
        '          "Content": [\n' +
        '            "User Permissions: File servers enable administrators to set permissions, ensuring that only authorized personnel access sensitive data.",\n' +
        '            "Networking significantly reduces costs by eliminating the need for duplicate devices or software licenses for every user.",\n' +
        '            "Hardware Costs: Instead of buying separate devices (e.g., printers, storage drives) for each employee, shared resources suffice.",\n' +
        '            "Software Licensing: Networking allows multiple users to share a single software license, reducing expenses.",\n' +
        '            "Energy Efficiency: A single printer or file server consumes less power than multiple individual devices, leading to lower energy bills.",\n' +
        '            "This cost-effective approach is particularly beneficial for small businesses and startups aiming to optimize resources."\n' +
        "          ]\n" +
        "        },\n" +
        "        {\n" +
        '          "H2": "1.2.2 Centralized Management",\n' +
        '          "Content": [\n' +
        '            "Networking provides administrators with the tools to manage all connected devices and systems from a central location, making maintenance and security more efficient.",\n' +
        '            "Monitoring: Admins can monitor network traffic, identify potential issues, and troubleshoot problems without physically accessing each device.",\n' +
        '            "Software Updates: Updates and patches can be deployed across all devices simultaneously, saving time and ensuring compatibility.",\n' +
        '            "Security Enhancements: Centralized control enables IT teams to enforce network-wide security protocols, such as firewalls, antivirus installations, and data encryption, ensuring consistency.",\n' +
        `            "For example, in an enterprise network, an admin can remotely restrict access to sensitive files or disable compromised accounts, protecting the organization's data."\n` +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    },\n" +
        "    {\n" +
        '      "H1": "1.3 History of Networking",\n' +
        '      "Content": []\n' +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Networking Evolution",\n' +
        '      "Content": [\n' +
        '        "The evolution of networking is a fascinating journey that began with early methods of communication and has transformed into the global connectivity we experience today. From the invention of the telegraph to modern internet technologies, networking has significantly impacted how we exchange information and interact. Key milestones include the development of packet-switching technology, the rise of local and wide-area networks, and the emergence of the internet."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "1.3.1 Telegraph and Telephone",\n' +
        '          "Content": [\n' +
        '            "The telegraph and telephone were groundbreaking technologies that laid the foundation for long-distance communication. These inventions marked the first instances where messages could travel faster than human or physical transportation.",\n' +
        `            "Telegraph: Invented in the early 19th century, the telegraph enabled the transmission of coded messages via electrical signals over wires. Samuel Morse's development of Morse code in 1837 revolutionized communication by standardizing the transmission of textual information.",\n` +
        `            "Telephone: Alexander Graham Bell's invention of the telephone in 1876 further advanced communication, allowing for real-time voice interaction over long distances. This innovation set the stage for modern telecommunication networks."\n` +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "1.3.1.1 Early Innovations",\n' +
        '              "Content": [\n' +
        '                "The early days of networking were characterized by a series of technological breakthroughs that enhanced the efficiency and scope of communication.",\n' +
        '                "Morse Code: This simple and effective coding system allowed messages to be transmitted using dots and dashes. It was widely adopted for long-distance communication via telegraph.",\n' +
        '                "Switching Stations: To manage increasing traffic, switching stations were introduced to route messages and calls, streamlining the process of connecting users over vast distances.",\n' +
        '                "These innovations served as the foundation for more advanced networking systems."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "1.3.1.1.1 Long-Distance Communication",\n' +
        '                  "Content": [\n' +
        '                    "Long-distance communication became feasible with the development of wires and electrical signal transmission. These advancements paved the way for global connectivity:"\n' +
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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Transcontinental Telegraph Lines",\n' +
        '      "Content": [\n' +
        '        "By the mid-19th century, telegraph lines connected cities and countries, enabling rapid communication across continents.",\n' +
        '        "The ability to transmit information across vast distances revolutionized industries such as trade, governance, and military operations."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "Submarine Cables",\n' +
        '          "Content": [\n' +
        '            "Undersea cables extended this connectivity across oceans, linking nations and fostering international collaboration."\n' +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    },\n" +
        "    {\n" +
        '      "H1": "Packet Switching",\n' +
        '      "Content": [\n' +
        '        "The introduction of packet-switching technology in the late 1960s transformed networking forever.",\n' +
        '        "This technology became the cornerstone of the internet, enabling the complex, scalable networks we rely on today."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "ARPANET",\n' +
        '          "Content": [\n' +
        '            "Developed by the U.S. Department of Defense’s Advanced Research Projects Agency (ARPA) in 1969, ARPANET was the first network to use packet-switching.",\n' +
        '            "This method divided data into smaller packets that were sent independently and reassembled at the destination.",\n' +
        '            "Unlike earlier methods, packet-switching utilized available bandwidth more effectively and allowed multiple users to share the same network resources.",\n' +
        '            "Packet-switching enhanced network reliability, as packets could take alternate routes if a particular path failed."\n' +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    },\n" +
        "    {\n" +
        '      "H1": "Types of Computer Networks",\n' +
        '      "Content": [\n' +
        '        "Computer networks come in various types, depending on their size, purpose, and coverage. From small, localized networks to vast, global infrastructures, each type of network has unique features and use cases."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "Local Area Network (LAN)",\n' +
        '          "Content": [\n' +
        '            "A Local Area Network (LAN) connects devices within a confined area, such as a home, office, or school.",\n' +
        '            "LANs are essential for sharing resources, enabling communication, and supporting collaborative work within a limited geographic range."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "Components of LAN",\n' +
        '              "Content": [\n' +
        '                "The functionality of a LAN relies on specific components that work together to enable seamless communication and resource sharing."\n' +
        "              ]\n" +
        "            }\n" +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Chapter 2",\n' +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "Section 2.1",\n' +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "Subsection 2.1.1",\n' +
        '              "Content": [\n' +
        '                "Switches: Direct data between devices within the LAN.",\n' +
        '                "Routers: Connect the LAN to external networks, like the internet.",\n' +
        '                "Devices: Include computers, printers, and storage devices that use the network for various tasks.",\n' +
        '                "These components form the backbone of a LAN, ensuring efficient data transfer and connectivity."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "Sub-subsection 2.1.1.1",\n' +
        '                  "Content": [\n' +
        '                    "Switches are crucial in LANs as they manage data flow between connected devices. They use packet-switching techniques to transmit data directly to the intended recipient, ensuring speed and reliability.",\n' +
        '                    "Data Routing: Switches ensure that data packets reach their destination efficiently.",\n' +
        '                    "Reduced Congestion: By directing data traffic intelligently, switches prevent network slowdowns"\n' +
        "                  ],\n" +
        '                  "SubSections": [\n' +
        "                    {\n" +
        '                      "H5": "Sub-sub-subsection 2.1.1.1.1",\n' +
        '                      "Content": [\n' +
        '                        "One of the key advantages of a LAN is the ability to create shared drives, which serve as centralized storage accessible to all authorized users.",\n' +
        '                        "Centralized Access: Files are stored in a common location, eliminating the need for multiple copies.",\n' +
        '                        "Security Controls: Administrators can assign permissions to ensure data integrity and confidentiality."\n' +
        "                      ],\n" +
        '                      "SubSections": [\n' +
        "                        {\n" +
        '                          "H6": "Sub-sub-sub-subsection 2.1.1.1.1.1",\n' +
        '                          "Content": [\n' +
        '                            "Shared drives enable seamless project collaboration by allowing team members to access and work on the same files.",\n' +
        '                            "Real-Time Updates: Changes made by one user are instantly visible to others.",\n' +
        '                            "Version Control: Shared drives often include tools to manage document versions, reducing errors.",\n' +
        '                            "Enhanced Productivity: Teams can work more efficiently without the need for constant file exchanges."\n' +
        "                          ]\n" +
        "                        }\n" +
        "                      ]\n" +
        "                    }\n" +
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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Chapter on Networks",\n' +
        '      "Content": [],\n' +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "2.2 Wide Area Network (WAN)",\n' +
        '          "Content": [\n' +
        '            "A Wide Area Network (WAN) spans vast geographic areas, connecting multiple Local Area Networks (LANs). WANs are essential for enabling communication and data transfer across distant locations, making them integral to global businesses and the internet."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "2.2.1 Internet as a WAN",\n' +
        '              "Content": [\n' +
        '                "The internet, the largest WAN, connects billions of devices worldwide. It provides a platform for communication, collaboration, and access to information across geographic boundaries."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "2.2.1.1 Multinational Operations",\n' +
        '                  "Content": [\n' +
        '                    "WANs enable businesses to operate across multiple locations, such as headquarters, regional offices, and production facilities.",\n' +
        '                    "Centralized Management: Enterprises can oversee and control operations from a central hub.",\n' +
        '                    "Unified Communication: Tools like video conferencing and VoIP ensure efficient communication across locations."\n' +
        "                  ],\n" +
        '                  "SubSections": [\n' +
        "                    {\n" +
        '                      "H5": "2.2.1.1.1 Synchronization",\n' +
        '                      "Content": [\n' +
        '                        "WANs facilitate real-time synchronization of data and operations between different branches or offices.",\n' +
        '                        "Consistency: Ensures all locations work with the same up-to-date information.",\n' +
        '                        "Efficiency: Reduces delays in data transfer, enhancing productivity"\n' +
        "                      ],\n" +
        '                      "SubSections": [\n' +
        "                        {\n" +
        '                          "H6": "2.2.1.1.1.1 Data Sharing",\n' +
        '                          "Content": [\n' +
        '                            "File sharing across locations is one of the primary benefits of WANs.",\n' +
        '                            "Speed: Large files can be transferred quickly between branches."\n' +
        "                          ]\n" +
        "                        }\n" +
        "                      ]\n" +
        "                    }\n" +
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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "Network Topologies",\n' +
        '      "Content": [\n' +
        `        "Network topology defines the structure of a network, describing how devices (nodes) and connections (links) are arranged. It plays a crucial role in determining the network's performance, reliability, and scalability. Choosing the right topology can optimize communication and reduce operational costs."\n` +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "What is Network Topology?",\n' +
        '          "Content": [\n' +
        '            "Network topology is the physical or logical layout of a network. It specifies how devices like computers, servers, and printers connect to each other and to the network infrastructure.",\n' +
        '            "Physical Topology: Refers to the actual arrangement of cables, devices, and other hardware.",\n' +
        '            "Logical Topology: Defines the flow of data within the network, irrespective of physical connections.",\n' +
        `            "The topology chosen impacts the network's speed, redundancy, and ease of troubleshooting."\n` +
        "          ]\n" +
        "        },\n" +
        "        {\n" +
        '          "H2": "Common Topologies",\n' +
        '          "Content": [\n' +
        '            "There are several types of network topologies, each with unique characteristics and applications. The most common include star, bus, ring, and mesh topologies."\n' +
        "          ],\n" +
        '          "SubSections": [\n' +
        "            {\n" +
        '              "H3": "Star Topology",\n' +
        '              "Content": [\n' +
        '                "Star topology is one of the most widely used arrangements, where all devices connect to a central device, such as a switch or hub.",\n' +
        '                "Centralized Control: The central device acts as a hub that facilitates all communication within the network.",\n' +
        '                "Simplified Management: The design makes it easy to manage and monitor the network from a single point."\n' +
        "              ],\n" +
        '              "SubSections": [\n' +
        "                {\n" +
        '                  "H4": "Centralized Devices",\n' +
        '                  "Content": [\n' +
        `                    "The central device in a star topology is crucial to the network's operation."\n` +
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
        "```",
      "```json\n" +
        "{\n" +
        '  "Title": "Extracted PDF Content",\n' +
        '  "Sections": [\n' +
        "    {\n" +
        '      "H1": "3.2.1.1.1 Failures and Troubleshooting",\n' +
        '      "Content": [\n' +
        '        "While the central device in a star topology is a critical component, its failure can disrupt the entire network. However, troubleshooting is typically straightforward due to the centralized design."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "Key Points",\n' +
        '          "Content": [\n' +
        '            "Hub or Switch: It serves as the point where all devices (nodes) connect.",\n' +
        '            "Data Routing: The central device ensures that data sent from one node reaches its intended destination efficiently.",\n' +
        '            "For example, in an office network, all computers might connect to a central switch, which then connects to the internet."\n' +
        "          ]\n" +
        "        },\n" +
        "        {\n" +
        '          "H2": "Troubleshooting Benefits",\n' +
        '          "Content": [\n' +
        '            "Quick Diagnosis: Administrators can focus on the central device to identify and resolve issues.",\n' +
        '            "Partial Connectivity: If a single device or cable fails, it does not affect the rest of the network."\n' +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    },\n" +
        "    {\n" +
        '      "H1": "3.2.1.1.1.1 Scalability",\n' +
        '      "Content": [\n' +
        '        "Star topology is highly scalable, making it suitable for networks that need to grow over time.",\n' +
        '        "For example, a company expanding its office can connect new computers to the existing switch, ensuring uninterrupted workflow."\n' +
        "      ],\n" +
        '      "SubSections": [\n' +
        "        {\n" +
        '          "H2": "Scalability Benefits",\n' +
        '          "Content": [\n' +
        '            "Adding Devices: New devices can be added to the network without affecting existing connections.",\n' +
        `            "Reduced Disruption: Expansion is seamless, as only the central device's capacity might need upgrading.",\n` +
        '            "Future-Proofing: The topology easily accommodates additional users and devices, making it ideal for dynamic environments."\n' +
        "          ]\n" +
        "        }\n" +
        "      ]\n" +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "```",
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

    // Now parse the cleaned string into a JSON object
    try {
      const jsonData = JSON.parse(combinedDataString);
      console.log(JSON.stringify(jsonData, null, 2));
      saveContentToDatabase(jsonData);
      return jsonData;
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
    if (typeof contentData === "string") {
      jsonData = JSON.parse(contentData); // Parse the string into an object
    }

    console.log("Parsed JSON Data:", JSON.stringify(jsonData, null, 2));

    // Save the parsed data to the database
    const savedData = await pdfExtractService.savePdfData(jsonData); // Ensure savePdfData is called correctly

    // Optionally log the saved data or handle it further
    console.log("Data saved:", savedData);

    return savedData; // Returning saved data, or you could return a success message
  } catch (error) {
    console.error("Error saving content:", error);
    throw error; // Propagate the error if needed
  }
}

async function getMindMapController(req, res) {
  try {
    const id = req.params.id;
    const mindMapData = await pdfExtractService.getMindMapData(id);

    res.status(200).json(mindMapData);
  } catch (error) {
    console.error("Error in getMindMapController:", error);

    res.status(500).json({
      message: error.message || "Failed to fetch mind map data",
    });
  }
}

export { extractPdfContent, processExtractedContent, getMindMapController };
