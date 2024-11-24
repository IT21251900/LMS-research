import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SETTINGS } from '../config/common.settings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private http: HttpClient) {}

  createRole(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${SETTINGS.BASE_API}/roles/create`, payload).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }

  updateRole(payload: any): Promise<any> {
    console.log('update data :', payload);
    return new Promise((resolve, reject) => {
      this.http.put(`${SETTINGS.BASE_API}/roles/update`, payload).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }

  deleteRole(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${SETTINGS.BASE_API}/roles/delete/${id}`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  getOneRoleById(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${SETTINGS.BASE_API}/roles/get-one/${id}`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  getPagedRoles(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(`${SETTINGS.BASE_API}/roles/get-paged`, payload)
        .subscribe({
          next: (response: any) => {
            resolve(response);
          },
          error: (error: any) => {
            reject(error);
          },
        });
    });
  }

  // Permission APIs
  getPermissionsByGroup(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${SETTINGS.BASE_API}/permission/get-by-group`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  getRolesForOptions(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${SETTINGS.BASE_API}/roles/get`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  // getRolesForOptions(): Observable<any> {
  //   return this.http.get(`${SETTINGS.BASE_API}/roles/get`);
  // }
}
