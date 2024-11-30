import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {AuthGuard} from "./core/guards/auth.guard";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {TokenInterceptor} from "./core/interceptors/http.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideRouter(routes),
    provideHttpClient(
      withInterceptors([TokenInterceptor]),
    ),
    AuthGuard,
  ]
};
