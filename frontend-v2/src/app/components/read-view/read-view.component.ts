import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-read-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './read-view.component.html',
  styleUrls: ['./read-view.component.scss'],
})
export class ReadViewComponent {
  jsonData: any = null; // Placeholder for the JSON data

  ngOnInit() {
    this.jsonData = this.getJsonDataFromLocalStorage();
    console.log("Json data",this.jsonData)
  }

  convertJsonToList(json: any): string[] {
    const result: string[] = [];

    const traverse = (data: any, prefix: string = '') => {
      if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const value = data[key];
            const newPrefix = prefix ? `${prefix} > ${key}` : key;

            // If it's an array, process each item
            if (Array.isArray(value)) {
              value.forEach((item) => traverse(item, newPrefix));
            } else if (typeof value === 'object') {
              // If it's an object, traverse it
              traverse(value, newPrefix);
            } else {
              // If it's a string or a number, add to result
              result.push(`${newPrefix}: ${value}`);
            }
          }
        }
      } else {
        // If data is not an object or array, add it directly
        result.push(`${prefix}: ${data}`);
      }
    };

    traverse(json);
    localStorage.setItem("extractedPdfContent", JSON.stringify(json));
    return result;
  }

  get listData(): string[] {
    return this.convertJsonToList(this.jsonData);
  }

  getJsonDataFromLocalStorage(): any | null {
    const storedResponse = localStorage.getItem("jsonData");

    if (storedResponse) {
      console.log(
        "Retrieved cleaned response from localStorage:",
        storedResponse
      );
      // Parse the JSON string back into an object
      return JSON.parse(storedResponse);
    } else {
      console.log("No data found in localStorage.");
      return null; 
    }
  }
}
