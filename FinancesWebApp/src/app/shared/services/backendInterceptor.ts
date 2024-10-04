import { inject, Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  private isRefreshingToken = false;
  
  constructor(){}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.addAccessTokenToRequest(request,next);
  }

  // session expires when refreshtoken is expired, but no seamless transition when accesstoken expires
  private addAccessTokenToRequest(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = localStorage.getItem("loginToken");

    const authHeader =  `Bearer ${accessToken}`;
    const requestWithAuthHeader = request.clone({ setHeaders: { Authorization: authHeader } });

    return next.handle(requestWithAuthHeader).pipe(
      catchError((error) => {
        if(error.status !== 401 || this.isRefreshingToken) return throwError(error);
          
        this.isRefreshingToken = true;

        this.authService.refreshToken().pipe(
          catchError((error) => {
            this.authService.sessionExpired();
            return throwError(error);
          }),
        ).subscribe((token) => {
          this.isRefreshingToken = false;
          window.location.reload();
        })

        return throwError("");
      }
    ));
  }
}