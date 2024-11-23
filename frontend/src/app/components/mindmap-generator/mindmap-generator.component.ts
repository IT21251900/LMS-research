import { Component, AfterViewChecked, ChangeDetectorRef } from "@angular/core";
import { MindMapService } from "../../core/services/mindmap.service";
import { Router, ActivatedRoute } from "@angular/router";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import mermaid from "mermaid";

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

  constructor(
    private mindmapservice: MindMapService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef to trigger change detection manually
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.contentId = params.get("id");
      if (this.contentId) {
        this.loadPdfExtractedData(this.contentId);
      }
    });
  }

  ngAfterViewChecked() {
    // Trigger Mermaid rendering manually when mermaidString is set
    if (this.mermaidString) {
      try {
        // Select the container for Mermaid diagrams
        const mermaidElement = document.querySelector(
          ".mermaid"
        ) as HTMLElement;
        if (mermaidElement) {
          // Clear any previous content to avoid duplicate diagrams
          mermaidElement.innerHTML = this.mermaidString;

          // Initialize Mermaid for the new content
          mermaid.init(undefined, mermaidElement);
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
      } finally {
        // Reset mermaidString to prevent re-rendering on every change detection cycle
        this.mermaidString = null;
        this.cdr.detectChanges(); // Trigger change detection to update the view
      }
    }
  }

  loadPdfExtractedData(contentId: string): void {
    console.log("Loading data for Content ID:", contentId);
    this.isLoading = true;
    this.mindmapservice
      .getOnePdfExtractContentById(contentId)
      .then((response) => {
        this.extractedData = response;
        console.log("Extracted Data:", this.extractedData);
        this.mermaidString = this.convertToMermaidFormat(this.extractedData);
        console.log("Mermaid String:", this.mermaidString);
        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        this.isLoading = false;
      });
  }

  convertToMermaidFormat(jsonData: any): string {
    let mermaidString = "mindmap\n  Root\n"; // Ensure a single root node is present.

    jsonData.Sections.forEach((section: any) => {
      // Add the H1 as a child of the root node
      mermaidString += `    ${this.escapeText(section.H1)}\n`;

      section.SubSections.forEach((subsection: any) => {
        mermaidString += `      ${this.escapeText(subsection.H2)}\n`;

        subsection.Content.forEach((content: any) => {
          const paragraphs = this.splitText(
            this.escapeText(content.Paragraphs),
            50
          ); // Escape and clean paragraphs
          paragraphs.forEach((line: string) => {
            mermaidString += `        ${line.trim()}\n`;
          });
        });
      });

      // Add Content directly under H1 if there are no SubSections
      if (section.Content.length > 0) {
        section.Content.forEach((content: any) => {
          const paragraphs = this.splitText(content.Paragraphs, 50);
          paragraphs.forEach((line: string) => {
            mermaidString += `      ${line.trim()}\n`;
          });
        });
      }
    });

    return mermaidString.trim(); // Trim the final string to remove trailing spaces or newlines.
  }

  escapeText(text: string): string {
    // Remove words or phrases enclosed in parentheses
    text = text.replace(/\(.*?\)/g, "");

    // Remove words or phrases enclosed in double slashes
    text = text.replace(/\/\/.*?\/\//g, "");

    // Optionally clean up extra spaces left behind
    text = text.replace(/\s{2,}/g, " ").trim(); // Replaces multiple spaces with a single space

    return text;
  }

  // Split long text into shorter lines for Mermaid.js compatibility
  splitText(text: string, maxLength: number): string[] {
    const words = text.split(" ");
    let currentLine = "";
    const lines: string[] = [];

    words.forEach((word) => {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    });

    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}
