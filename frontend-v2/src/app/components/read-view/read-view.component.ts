import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MindMapService } from '../../core/services/mindmap.service';
import { TextExtractService } from '../../core/services/textextract.service';

@Component({
  selector: 'app-read-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './read-view.component.html',
  styleUrls: ['./read-view.component.scss'],
})
export class ReadViewComponent {
  isLoading: boolean = false; 
  extractedData: any = null;

  constructor(
    private textExtractService: TextExtractService,
  ) {}

  
  ngOnInit() {
   this.loadPdfExtractedData();
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
