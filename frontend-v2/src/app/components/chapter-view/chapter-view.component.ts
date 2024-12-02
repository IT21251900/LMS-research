import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextExtractService } from '../../core/services/textextract.service';

@Component({
  selector: 'app-chapter-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './chapter-view.component.html',
  styleUrls: ['./chapter-view.component.scss']
})
export class ChapterViewComponent {
  isLoading: boolean = false;
  extractedData: any[] = []; // Assuming the response is an array
  filteredData: any[] = [];
  h1Topics : any;

  constructor(private textExtractService: TextExtractService) {}

  ngOnInit() {
    this.loadPdfExtractedData();
  }

  async loadPdfExtractedData(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.textExtractService.getpdfcontentExtractElements();
      this.extractedData = response;
  
      // Extract H1 topics
      this.h1Topics = this.extractedData
        .filter(element => element.font.isH1)
        .map(element => element.text.trim());
  
      console.log("H1 Topics:", this.h1Topics);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      this.isLoading = false;
    }
  }
  
  

  getDynamicStyles(font: any): any {
    return {
      'font-size': `${font.size}`,
      'font-weight': font.weight === 700 ? 'bold' : 'normal',
      'font-family': font.family,
      'font-style': font.italic ? 'italic' : 'normal',
      'color': font.color,
      'margin-bottom': '10px'
    };
  }
}
