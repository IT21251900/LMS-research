import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SETTINGS } from '../config/common.settings';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  /**
   * Uploads a PDF file to the server for extraction.
   * @param file The PDF file to be uploaded.
   * @returns A Promise containing the extracted data.
   */
  uploadPdf(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('pdf', file);

    const headers = new HttpHeaders({
    });

    return new Promise((resolve, reject) => {
      this.http
        .post(`${SETTINGS.MINDMAP_BASE_URL}/lms/pdfExtract`, formData, { headers })
        .subscribe({
          next: (response: any) => {
            resolve(response);
          },
          error: (error: any) => {
            console.error('Error uploading PDF:', error);
            reject(error);
          },
        });
    });
  }
}
