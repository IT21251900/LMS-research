import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chapter-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './chapter-view.component.html',
  styleUrls: ['./chapter-view.component.scss']
})
export class ChapterViewComponent {
  jsonData: any = null; // Placeholder for the JSON data

  ngOnInit() {
    this.jsonData = this.getJsonDataFromLocalStorage();
    console.log("Json data", this.jsonData);
  }

  // Function to extract all h1 tags from the JSON
  getH1TagsFromJson(json: any): string[] {
    const result: string[] = [];

    const traverse = (data: any) => {
        if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key];

                    // Check if the key is 'H1' and add its value to the result
                    if (key === 'H1' && typeof value === 'string') {
                        result.push(value);
                    }

                    // If it's an array, process each item
                    if (Array.isArray(value)) {
                        value.forEach(item => traverse(item));
                    } else if (typeof value === 'object') {
                        // If it's an object, traverse it
                        traverse(value);
                    }
                }
            }
        }
    };

    traverse(json);
    console.log("H1 tags found:", result); // Log the found H1 tags
    return result;
}


  get h1Tags(): string[] {
    return this.getH1TagsFromJson(this.jsonData);
  }

  getJsonDataFromLocalStorage(): any | null {
    const storedResponse = localStorage.getItem("extractedPdfContent");

    if (storedResponse) {
      // Log the raw string from localStorage for debugging
      console.log("Retrieved cleaned response from localStorage:", storedResponse);

      try {
        // Parse the JSON string back into an object
        return JSON.parse(storedResponse);
      } catch (error) {
        console.error("Failed to parse JSON from localStorage:", error);
        return null; // Return null if parsing fails
      }
    } else {
      console.log("No data found in localStorage.");
      return null; 
    }
  }
}
