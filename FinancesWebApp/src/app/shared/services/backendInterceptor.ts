import { inject, Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  
  constructor(){}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const loginToken = localStorage.getItem('loginToken');

    if (loginToken) request = this.addToken(request, loginToken);
    
    return next.handle(request).pipe(
      // Falls der Request einen 401 Fehler liefert, Token erneuern
      catchError(error => {
        if (error.status === 401 && this.authService.getRefreshToken()) {
          return this.authService.refreshToken().pipe(
            switchMap((response: any) => {
              // Neues Access Token zum Request hinzufügen und erneut senden
              return next.handle(this.addToken(request, response.accessToken));
            }),
            catchError(err => {
              // Falls die Token-Erneuerung fehlschlägt, Benutzer abmelden
              this.authService.clearTokens();
              return throwError(err);
            })
          );
        } else {
          return throwError(error);
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