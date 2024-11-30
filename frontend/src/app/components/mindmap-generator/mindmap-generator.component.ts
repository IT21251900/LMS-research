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
  //   const prompt = ` You are a mind map generator. Convert the following JSON into Mermaid.js mind map input format. 
  //   For each object or array, create corresponding nodes and sub-nodes. 
    
  //   1. If there are long paragraphs inside the "paragraph" tags, split them into simple sentences for better readability.
  //   2. Remove any unwanted characters like special symbols or redundant information.
  //   3. For each paragraph, ensure that it's concise and doesn't exceed a few sentences, keeping it readable.
  //   4. Maintain the hierarchical structure from the JSON as nodes and sub-nodes in the mind map.

  //   This is the JSON data you need to convert to mermaid below format.:     JSON: ${JSON.stringify(jsonData)}

  //   Bellow I'll proivde a template how to break the things into nodes.Use this template to generate the ermaid js input format.Don't add any of your thoughts to this.
  //   return the template only.Don't add any text or any special characters to it.Just give me the output like below format.
  //   The format is below.

  //   mindmap
  // root
  //   What is AI?
  //     Artificial Intelligence refers to the simulation of human intelligence.
  //     AI is programmed to think like humans and mimic their actions.
  //     The goal of AI is to enable machines to perform tasks.
  //     Tasks include visual perception, speech recognition, decision-making, and language translation.
  //   Applications of AI
  //     AI is widely used in various industries.
  //     In healthcare, AI helps diagnose diseases and predict patient outcomes.
  //     It also helps develop personalized treatment plans.
  //     In finance, AI is used for fraud detection.
  //     AI also supports algorithmic trading and customer service automation.`;

  //   // Define payload for API request
  //   const payload = {
  //     model: "gpt-4o",
  //     messages: [{ role: "user", content: prompt }],
  //     max_tokens: 2000,
  //     temperature: 0.1,
  //   };

  //   const headers = {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${OPENAI_API_KEY}`,
  //   };

    try {
      // Making the API request

      // const response: any = await this.http
      //   .post(this.apiUrl, payload, { headers })
      //   .toPromise();

      const response = [
     `mindmap
        root
          Combined Extracted PDF Content
            Extracted PDF Content
              1.1 What is Networking?
                Networking is the process of connecting multiple devices to enable communication and resource sharing.
                Connections can be wired or wireless, forming the backbone of modern technology.
                Networking supports home setups to complex global infrastructures.
                Devices share internet connections, storage, and processing power efficiently.
                Home networks connect devices to a single internet source.
                Corporate networks link offices for seamless collaboration.
              1.1.1 Examples of Networking
                Networking improves efficiency and connectivity in daily life and organizations.
                It supports real-time interactions across platforms.
                Banking Systems
                  Networking connects branches, ATMs, and online platforms for integrated services.
                  Personal Devices connect to the internet for sharing files or online communication.
                  Corporate Systems use LANs for secure data sharing and collaboration.
                  Public Services maintain databases and enable online services.
                  Inter-branch Connectivity allows customers to access accounts from any location.
                  ATM Networks use secure protocols for transactions and inquiries.
            Extracted PDF Content
              Chapter 1
                Networking ensures banking services are available 24/7.
              1.1.1.1.1 Online Transactions
                Networking enables secure online transactions via encrypted systems.
                Fund Transfers process transactions in real-time.
                Payments enable secure online shopping and bill payments.
                Fraud Detection systems monitor transactions for suspicious activities.
                Seamless connectivity empowers convenient financial management.
              1.1.1.1.1.1 Real-Time Systems
                Real-time systems support instant processing.
                Immediate Data Processing occurs in milliseconds.
                High Availability minimizes downtime.
                Error Reduction improves reliability.
                Examples include messaging apps and trading platforms.
              1.2 Key Benefits of Networking
                Networking is essential for communication and resource sharing.
                It helps individuals and organizations achieve efficiency.
                Resource Sharing
                  Networking facilitates access to shared resources.
                  It reduces redundancy and improves efficiency.
                  Office networks allow shared software access, saving money.
                1.2.1.1 Printers
                  Networking allows printer sharing among users.
                  Benefits of Networked Printers
                    Efficient Usage optimizes usage.
                    Accessibility enables remote printing.
                    Cost-Effective Maintenance lowers costs.
                1.2.1.1.1 File Servers
                  File servers allow centralized storage.
                  Benefits of File Servers
                    Centralized Storage makes backups easier.
                    Collaboration is facilitated by shared files.
            Extracted PDF Content
              1.2 Cost Savings
                Cost Savings
                  Networking reduces costs by avoiding duplicate devices.
                  Hardware Costs are minimized by shared resources.
                  Software Licensing allows shared licenses.
                  Energy Efficiency reduces power consumption.
              1.2.2 Centralized Management
                Networking provides centralized management tools.
                Monitoring allows network traffic analysis.
                Software Updates are deployed efficiently.
                Security Enhancements enforce network-wide protocols.
            Extracted PDF Content
              1.3 History of Networking
                The evolution of networking began with early communication methods.
                Key milestones include packet-switching and the internet.
                Telegraph and Telephone
                  These technologies laid the foundation for communication.
                  Telegraph enabled coded message transmission.
                  Telephone allowed real-time voice interaction.
                1.3.1.1 Early Innovations
                  Morse Code standardized transmission.
                  Switching Stations managed traffic.
                1.3.1.1.1 Long-Distance Communication
                  Advancements enabled global connectivity.
            Extracted PDF Content
              Transcontinental Telegraph Lines
                Mid-19th century telegraph lines connected cities and countries.
                Submarine Cables extended connectivity across oceans.
              Packet Switching
                Introduced in the 1960s, it transformed networking.
                ARPANET was the first to use packet-switching.
              Types of Computer Networks
                Networks vary in size and purpose.
                Local Area Network (LAN)
                  Connects devices within a confined area.
                  Components of LAN
                    Switches direct data within LAN.
                    Routers connect LAN to external networks.
                    Devices use the network for tasks.
                2.2 Wide Area Network (WAN)
                  WANs connect multiple LANs.
                  Internet as a WAN connects billions of devices globally.
                  2.2.1.1 Multinational Operations
                    WANs enable businesses to operate globally.
                    Synchronization ensures consistent data.
            Extracted PDF Content
              Network Topologies
                Network topology defines the structure of a network.
                What is Network Topology?
                  It determines how devices connect to each other.
                  Physical Topology refers to actual arrangement.
                  Logical Topology defines data flow.
                Common Topologies
                  Star Topology
                    Devices connect to a central device.
                    Centralized Control facilitates communication.
                    Scalability allows easy network growth.
              3.2.1.1.1 Failures and Troubleshooting
                The central device is critical, but failure can be resolved easily.
                Key Points
                  Hub connects all devices.
                  Data Routing ensures proper delivery.
                Troubleshooting Benefits
                  Quick Diagnosis identifies issues.
                  Partial Connectivity minimizes network-wide effects.
                Scalability
                  Star topology accommodates growth.
                  Scalability Benefits
                    Adding Devices is straightforward.
                    Reduced Disruption during expansion.
                    Future-Proofing for dynamic environments.`
      ];

    

      // Log response to understand its structure
      console.log("Response received:", response);

      // const messageContent = response.choices?.[0]?.message?.content;
      const messageContent = response;

      // Log or use the message content
      console.log("message content", messageContent);

      const cleanedResponse = messageContent[0]
        .replace(/```mermaid\s*/g, "") // Remove the opening ```mermaid
        .replace(/```/g, "")
        .replace(/`/g, "") 
        .replace(/[\[\]{}()]/g, "") // Remove the closing `
        .trim();

        // const cleanedResponse = messageContent
        // .replace(/```mermaid\s*/g, "") // Remove the opening ```mermaid
        // .replace(/```/g, "")
        // .replace(/`/g, "") 
        // .replace(/[\[\]{}()]/g, "") // Remove the closing `
        // .trim();

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
    const storedResponse = localStorage.getItem("mindmapData");

    if (storedResponse) {
      console.log(
        "Retrieved cleaned response from localStorage:",
        storedResponse
      );
      return storedResponse;
    } else {
      console.log("No data found in localStorage.");
      return null; 
    }
  }
}
