import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SETTINGS } from '../config/common.settings';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  loggedInUser = new BehaviorSubject({});
  constructor(private http: HttpClient) {}

  createUser(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${SETTINGS.BASE_API}/user/create`, payload).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }

  updateUser(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${SETTINGS.BASE_API}/user/update`, payload).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }
  getOneUserById(id = '12345'): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${SETTINGS.BASE_API}/user/get-one/${id}`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  getPagedUsers(payload: {
    pageIndex: number;
    pageSize: number;
    filters: any;
    sortField?: string;
    sortOrder?: number;
  }): Promise<any> {
    // Include sortField and sortOrder in the payload
    const requestPayload = {
      ...payload,
    };

    console.log('Request Payload:', requestPayload); // Debugging line

    return this.http
      .post(`${SETTINGS.BASE_API}/user/get-paged`, requestPayload)
      .toPromise()
      .then((response: any) => {
        console.log('Response Data:', response); // Debugging line
        return response;
      })
      .catch((error: any) => {
        console.error('Error in HTTP request:', error);
        throw error.error;
      });
  }

  getAllUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${SETTINGS.BASE_API}/user/get-all`).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }

  AdminResetPassword(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(`${SETTINGS.BASE_API}/user/request-reset-password`,payload)
        .subscribe({
          next: (response: any) => {
            resolve(response);
          },
          error: (error: any) => {
            reject(error.error);
          },
        });
    });
  }

  changePassword(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(`${SETTINGS.BASE_API}/user/change-password`, payload)
        .subscribe({
          next: (response: any) => {
            resolve(response);
          },
          error: (error: any) => {
            reject(error.error);
          },
        });
    });
  }
}
