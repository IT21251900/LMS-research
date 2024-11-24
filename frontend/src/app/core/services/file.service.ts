import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SETTINGS} from "../config/common.settings";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  fileUploadingSubject = new BehaviorSubject({});
  constructor(private http: HttpClient) { }

  postFile(file: any, type: string): Observable<any> {
    this.fileUploadingSubject.next({ type, loading: true });
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${SETTINGS.BASE_API}/files/upload`, formData);
  }
}
