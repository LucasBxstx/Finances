import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { TokenResult } from "../models/auth";

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  
  constructor(){}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const loginToken = localStorage.getItem('loginToken');

    if (loginToken) request = this.addToken(request, loginToken);
    
    return next.handle(request).pipe(
      // Falls der Request einen 401 Fehler liefert, Token erneuern
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.authService.getRefreshToken()) {
          return this.authService.refreshToken().pipe(
            switchMap((token: TokenResult | null) => {
              if(!token) return throwError("No refresh token available");
              // Neues Access Token zum Request hinzufügen und erneut senden
              request = this.addToken(request, token.accessToken);
              return next.handle(request);
            }),
            catchError((error: HttpErrorResponse) => {
              if(error.status === 401) this.authService.sessionExpired();
              // Falls die Token-Erneuerung fehlschlägt, Benutzer abmelden
              
              return throwError("Session closed because refresh token expired");
            })
          );
        } else {
          return throwError("Server not reachable");
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}