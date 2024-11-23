import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {SETTINGS} from "../../../core/config/common.settings";
import {Observable, Subject, tap} from "rxjs";
import {catchError} from "rxjs/operators";
import {EncryptionService} from "../../../core/services/encryption.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginStatus = new Subject();
  constructor(private http: HttpClient,
              private encryption: EncryptionService,
              private router: Router,) { }

  login(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${SETTINGS.BASE_API}/user/login`, payload).subscribe({
        next: (response: any) => {
          this.setSession(response);
          resolve(response);
        },
        error: (error: any) => {
          reject(error.error);
        },
      });
    });
  }

  private setSession(authResult: any): void {
    const { access_token, refresh_token, user } = authResult;
    this.setLoggedInUser(JSON.stringify(user));
    localStorage.setItem(
      SETTINGS.ACCESS_TOKEN,
      this.encryption.encrypt(access_token),
    );
    localStorage.setItem(
      SETTINGS.REFRESH_TOKEN,
      this.encryption.encrypt(refresh_token),
    );
    this.loginStatus.next({ isAuthenticated: true });
  }

  setLoggedInUser(userStr: any): void {
    localStorage.setItem(
      SETTINGS.LOGGED_IN_USER,
      this.encryption.encrypt(userStr),
    );
  }

  getLoggedInUser(): any {
    const userStrEnc: any = localStorage.getItem(SETTINGS.LOGGED_IN_USER);
    return JSON.parse(this.encryption.decrypt(userStrEnc));
  }

  public isLoggedIn(): any {
    if (
      localStorage.getItem(SETTINGS.ACCESS_TOKEN) != null &&
      localStorage.getItem(SETTINGS.REFRESH_TOKEN) != null
    ) {
      const tokenENC: any = localStorage.getItem(SETTINGS.ACCESS_TOKEN);
      try {
        return this.encryption.decrypt(tokenENC);
      } catch (e) {
        this.logout();
      }
    }
    return false;
  }

  getToken(): any {
    if (localStorage.getItem(SETTINGS.ACCESS_TOKEN) != null) {
      const tokenENC: any = localStorage.getItem(SETTINGS.ACCESS_TOKEN);

      try {
        return this.encryption.decrypt(tokenENC);
      } catch (e) {
        return '';
      }
    }
    return false;
  }

  refreshToken(): Observable<any> {
    return this.http
      .post(`${SETTINGS.BASE_API}/user/refresh-token`, {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(
        tap((res: any) => {
          localStorage.setItem(
            SETTINGS.ACCESS_TOKEN,
            this.encryption.encrypt(res.access_token),
          );
        }),
        catchError((err, caught) => {
          localStorage.clear();
          this.router.navigate(['/auth/login']);
          return err;
        }),
      );
  }

  getRefreshToken(): any {
    if (localStorage.getItem(SETTINGS.REFRESH_TOKEN) != null) {
      const refreshTokenENC: any = localStorage.getItem(SETTINGS.REFRESH_TOKEN);

      try {
        return this.encryption.decrypt(refreshTokenENC);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  logout(): void {
    this.http.post(`${SETTINGS.BASE_API}/user/logout`, {}).subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
