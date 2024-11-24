import { Component, AfterViewChecked, ChangeDetectorRef } from "@angular/core";
import { MindMapService } from "../../core/services/mindmap.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import mermaid from "mermaid";
import { HttpClient } from "@angular/common/http";
import { environment, OPENAI_API_KEY } from "../../../environments/environment";

@Component({
  selector: "app-mindmap-generator",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./mindmap-generator.component.html",
  styleUrls: ["./mindmap-generator.component.scss"],
})
export class MindmapGeneratorComponent implements AfterViewChecked {
  isLoading: boolean = false;
  contentId: string | null = null;
  extractedData: any = null; // Variable to store the extracted data
  mermaidString: string | null = null; // Variable to store the Mermaid string
  private apiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(
    private mindmapservice: MindMapService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // this.route.paramMap.subscribe((params) => {
    //   this.contentId = params.get("id");
    //   if (this.contentId) {
    //     this.loadPdfExtractedData(this.contentId);
    //   }
    // });
  }

  ngAfterViewChecked() {
    if (this.mermaidString) {
      try {
        const mermaidElement = document.querySelector(
          ".mermaid"
        ) as HTMLElement;
        if (mermaidElement) {
          mermaidElement.innerHTML = this.mermaidString;
          mermaid.init(undefined, mermaidElement);
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
      } finally {
        this.mermaidString = null;
        this.cdr.detectChanges();
      }
    }
  }

  async loadPdfExtractedData(contentId: string): Promise<void> {
    console.log("Loading data for Content ID:", contentId);
    this.isLoading = true;
    try {
      const response =
        await this.mindmapservice.getOnePdfExtractContentById(contentId);
      this.extractedData = response;
      console.log("Extracted Data:", this.extractedData);

      // Wait for the Mermaid string to be generated
      this.mermaidString = await this.convertToMermaidFormat(
        this.extractedData
      );

      console.log("Mermaid String:", this.mermaidString);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async convertToMermaidFormat(jsonData: any): Promise<string> {
    // Constructing the prompt with the JSON data
    const prompt = ` You are a mind map generator. Convert the following JSON into Mermaid.js mind map input format. 
    For each object or array, create corresponding nodes and sub-nodes. 
    
    1. If there are long paragraphs inside the "paragraph" tags, split them into simple sentences for better readability.
    2. Remove any unwanted characters like special symbols or redundant information.
    3. For each paragraph, ensure that it's concise and doesn't exceed a few sentences, keeping it readable.
    4. Maintain the hierarchical structure from the JSON as nodes and sub-nodes in the mind map.

    This is the JSON data you need to convert to mermaid below format.:     JSON: ${JSON.stringify(jsonData)}

    Bellow I'll proivde a template how to break the things into nodes.Use this template to generate the ermaid js input format.Don't add any of your thoughts to this.
    return the template only.Don't add any text or any special characters to it.Just give me the output like below format.
    The format is below.

    mindmap
  root
    What is AI?
      Artificial Intelligence refers to the simulation of human intelligence.
      AI is programmed to think like humans and mimic their actions.
      The goal of AI is to enable machines to perform tasks.
      Tasks include visual perception, speech recognition, decision-making, and language translation.
    Applications of AI
      AI is widely used in various industries.
      In healthcare, AI helps diagnose diseases and predict patient outcomes.
      It also helps develop personalized treatment plans.
      In finance, AI is used for fraud detection.
      AI also supports algorithmic trading and customer service automation.`;

    // Define payload for API request
    const payload = {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 1.0,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    try {
      // Making the API request

      const response: any = await this.http
        .post(this.apiUrl, payload, { headers })
        .toPromise();

      // const response = [
      //   "```mindmap\n  root\n    Networking: An Overview\n      1. Introduction to Networking\n        Networking is the practice of connecting computers and other devices to share resources and information.\n        A computer network allows devices to communicate and exchange data.\n        The fundamental goal of networking is to enable communication between different systems.\n      2. Types of Networks\n        2.1 Local Area Network\n          A Local Area Network is a network within a small geographical area.\n          It allows for high-speed data transfer and resource sharing.\n        2.2 Wide Area Network\n          A Wide Area Network connects multiple LANs over a larger area.\n          WANs use technologies like leased lines and satellite communication.\n      3. Network Protocols\n        3.1 Transmission Control Protocol/Internet Protocol\n          TCP/IP is the fundamental protocol for internet communication.\n          It defines how data is transmitted between devices.\n        3.2 HyperText Transfer Protocol\n          HTTP is a protocol used for transmitting hypertext across the internet.\n          It is the foundation of data exchange on the World Wide Web.\n      4. Network Security\n        4.1 Firewalls\n          A firewall is a security system that protects a network from unauthorized access.\n          It can be implemented in both hardware and software.\n        4.2 Encryption\n          Encryption converts data into a code to prevent unauthorized access.\n          It ensures data transmitted over networks remains confidential and secure.\n```"
      // ];

      // Log response to understand its structure
      console.log("Response received:", response);

      const messageContent = response.choices?.[0]?.message?.content;

      // Log or use the message content
      console.log("message content", messageContent);

      const cleanedResponse = messageContent
        .replace(/```mermaid\s*/g, "") // Remove the opening ```mermaid
        .replace(/```/g, "") // Remove the closing ```
        .trim();

      console.log(cleanedResponse);
      localStorage.setItem("mindmapData", cleanedResponse);

      // Log to confirm it's stored
      console.log("Cleaned response saved to localStorage:", cleanedResponse);

      return cleanedResponse;
    } catch (error) {
      // Error handling
      console.error("Error converting to Mermaid format:", error);
      throw new Error("Failed to convert to Mermaid format.");
    }
  }

  getMindmapDataFromLocalStorage(): string | null {
    // Get the cleaned response from localStorage
    const storedResponse = localStorage.getItem("mindmapData");

    // Check if the response exists and log it
    if (storedResponse) {
      console.log(
        "Retrieved cleaned response from localStorage:",
        storedResponse
      );
      return storedResponse;
    } else {
      console.log("No data found in localStorage.");
      return null; // Return null if no data is found
    }
  }
}
