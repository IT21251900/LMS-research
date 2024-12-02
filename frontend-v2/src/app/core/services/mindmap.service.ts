import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SETTINGS } from '../config/common.settings';

@Injectable({
  providedIn: 'root',
})

export class MindMapService{
    constructor(private http: HttpClient) {}

    processPdfContentExtract(): Promise<any> {
      return new Promise((resolve, reject) => {
          this.http.post(`${SETTINGS.MINDMAP_BASE_URL}/lms/pdfcontentExtract`, {}).subscribe({
              next: (response: any) => {
                  resolve(response);
              },
              error: (error: any) => {
                  reject(error);
              },
          });
      });
  }

    getOnePdfExtractContentById(id:String): Promise<any> {
        return new Promise((resolve, reject) => {
          this.http.get(`${SETTINGS.MINDMAP_BASE_URL}/lms/getPdfExtractedData/${id}`).subscribe({
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