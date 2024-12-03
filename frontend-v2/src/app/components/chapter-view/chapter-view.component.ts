import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextExtractService } from '../../core/services/textextract.service';
import { Router } from '@angular/router'; // Import Router

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
  h1Topics : any[] = []; // Assuming h1Topics is an array

  constructor(private textExtractService: TextExtractService, private router: Router) {}

  ngOnInit() {
    this.loadPdfExtractedData();
  }

  async loadPdfExtractedData(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.textExtractService.getpdfcontentExtractElements();
      this.extractedData = response;

      // Extract H1 topics with page numbers
      this.h1Topics = this.extractedData
        .filter(element => element.font.isH1)
        .map(element => ({
          text: element.text.trim(),
          page: element.page, 
          id: `section-${element.page}` 
        }));

      console.log("H1 Topics:", this.h1Topics);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  highlightSection(page: number): void {
    this.router.navigate(['home/dashboard/chapters'], { queryParams: { page: page } }); 
  }
}
