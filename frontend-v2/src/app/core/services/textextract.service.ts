import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SETTINGS } from '../config/common.settings';

@Injectable({
  providedIn: 'root',
})

export class TextExtractService{
    constructor(private http: HttpClient) {}

    getpdfcontentExtractElements(): Promise<any> {
      return new Promise((resolve, reject) => {
          this.http.get(`${SETTINGS.MINDMAP_BASE_URL}/lms/pdfcontentExtractElements`, {}).subscribe({
              next: (response: any) => {
                  resolve(response);
              },
              error: (error: any) => {
                  reject(error);
              },
          });
      });
  }
}