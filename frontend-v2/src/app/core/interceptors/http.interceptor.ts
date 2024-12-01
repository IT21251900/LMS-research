import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import {inject} from "@angular/core";
import {AuthService} from "../../modules/auth/services/auth.service";
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import {BehaviorSubject, Observable, throwError} from "rxjs";


export const TokenInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next:
  HttpHandlerFn) => {
  const authService = inject(AuthService);
  let isRefreshing = false;
  let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null,
  );

  /* Headers without Token */
  const addGeneralHeaders = (request: HttpRequest<any>): HttpRequest<any> => {
    return request.clone({
      setHeaders: {
        // 'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
    });
  }

  /* Headers with Token */
  const addToken = (request: HttpRequest<any>, token: any): HttpRequest<any> => {
    return request.clone({
      setHeaders: {
        // 'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /* Re-send the previous request after refreshing the access token */
  const handleAccessTokenExpiredError = (
    request: HttpRequest<any>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((token: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(token.access_token);
          return next(addToken(request, token.access_token));
        }),
      );
    } else {
      return refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next(addToken(request, jwt));
        }),
      );
    }
  }

  if (authService.getToken() && !request.headers.has('Authorization')) {
    request = addToken(request, authService.getToken());
  } else {
    request = addGeneralHeaders(request);
  }
  return next(request).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 403 &&
        authService.isLoggedIn()
      ) {
        return handleAccessTokenExpiredError(request, next);
      } else {
        // this.msg.error(error?.error?.message || "Something went wrong. Please contact technical team");
        return throwError(error);
      }
    }),
  );
};


