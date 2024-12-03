// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MindMapService } from '../../core/services/mindmap.service';
// import { TextExtractService } from '../../core/services/textextract.service';

// @Component({
//   selector: 'app-read-view',
//   imports: [CommonModule],
//   standalone: true,
//   templateUrl: './read-view.component.html',
//   styleUrls: ['./read-view.component.scss'],
// })
// export class ReadViewComponent {
//   isLoading: boolean = false; 
//   extractedData: any = null;

//   constructor(
//     private textExtractService: TextExtractService,
//   ) {}

  
//   ngOnInit() {
//    this.loadPdfExtractedData();
//   }


//   async loadPdfExtractedData(): Promise<void> {
//     this.isLoading = true; 
//     try {
//       const response = await this.textExtractService.getpdfcontentExtractElements();
//       this.extractedData = response; 
//       console.log("Extracted Data:", this.extractedData);
//     } catch (error) {
//       console.error("Error loading data:", error);
//     } finally {
//       this.isLoading = false; 
//     }
//   }

//   getDynamicStyles(font: any): any {
//     return {
//         'font-size': `${font.size}`,
//         'font-weight': font.weight === 700 ? 'bold' : 'normal',
//         'font-family': font.family,
//         'font-style': font.italic ? 'italic' : 'normal', 
//         'color': font.color,
//         'margin-bottom': '10px' 
//     };
// }

// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextExtractService } from '../../core/services/textextract.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-read-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './read-view.component.html',
  styleUrls: ['./read-view.component.scss'],
})
export class ReadViewComponent implements OnInit {
  isLoading: boolean = false;
  extractedData: any[] = [];
  highlightedText: string | null = null;

  constructor(
    private textExtractService: TextExtractService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const page = params['page'];
      this.loadPdfExtractedData(page); // Pass the page parameter to highlight section on load
    });
  }

  async loadPdfExtractedData(highlightPage?: string): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.textExtractService.getpdfcontentExtractElements();
      this.extractedData = response;
      console.log('Extracted Data:', this.extractedData);

      if (highlightPage) {
        this.highlightSectionByPage(highlightPage);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  highlightSectionByPage(page: string): void {
    const targetElement = this.extractedData.find(
      element => element.page === Number(page)
    );
    console.log('Target Element:', targetElement);
  
    if (targetElement) {
      this.highlightedText = targetElement.text.trim();
      const targetText = targetElement.text.trim().toLowerCase();
      console.log('Target Text:', targetText);
  
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        const paragraphs = mainContent.querySelectorAll('span');
  
        Array.from(paragraphs).forEach(paragraph => {
          // Check if the paragraph contains the exact matching text
          if (paragraph.textContent?.trim().toLowerCase() === targetText) {
            // Scroll the element into view within .main-content
            paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    } else {
      console.error(`No element found for page: ${page}`);
    }
  }
  
  

  getHierarchyLevel(text: string, font: any): number {
    const match = text.match(/^(\d+(\.\d+)*)/);
    if (match) {
      return match[0].split('.').length; 
    }
    if (font.weight >= 700) {
      if (font.size >= 15) return 1; 
      if (font.size >= 13) return 2; 
      if (font.size >= 12) return 3; 
    } else {
      if (font.size >= 11) return 4; 
    }
    return 5;
  }

  
  getDynamicStyles(font: any): any {
    return {
      'font-size': `${font.size}px`,
      'font-weight': font.weight === 700 ? 'bold' : 'normal',
      'font-family': font.family,
      'font-style': font.italic ? 'italic' : 'normal',
      'color': font.color,
      'margin-bottom': '5px',
    };
  }
}
