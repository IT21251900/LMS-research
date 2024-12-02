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
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

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
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadPdfExtractedData();
    this.route.queryParams.subscribe(params => {
      const page = params['page']; 
      if (page) {
        this.highlightSectionByPage(page); 
      }
    });
  }

  async loadPdfExtractedData(): Promise<void> {
    this.isLoading = true; 
    try {
      const response = await this.textExtractService.getpdfcontentExtractElements();
      this.extractedData = response; 
      console.log("Extracted Data:", this.extractedData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      this.isLoading = false; 
    }
  }

  async highlightSectionByPage(page: string): Promise<void> {
    await this.loadPdfExtractedData();
    const targetElement = this.extractedData.find(element => element.page === Number(page));
    console.log("Target Element:", targetElement); 
  
    if (targetElement) {
      this.highlightedText = targetElement.text.trim();
      const targetText = targetElement.text.trim().toLowerCase(); 
      console.log("Target Text:", targetText);
  
      const paragraphs = document.querySelectorAll('p'); 

      const paragraphsArray = Array.from(paragraphs);
  
      for (const paragraph of paragraphsArray) {
        if (paragraph.textContent?.trim().toLowerCase() === targetText) {
          paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break; 
        }
      }
    } else {
      console.error(`No element found for page: ${page}`);
    }
  }
  
  getDynamicStyles(font: any): any {
    return {
      'font-size': font.size,
      'font-weight': font.weight === 700 ? 'bold' : 'normal',
      'font-family': font.family,
      'font-style': font.italic ? 'italic' : 'normal', 
      'color': font.color,
      'margin-bottom': '5px' 
    };
  }
}
