import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
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
      catchError((error : HttpErrorResponse) => {
        // Only refresh token if token is expired
        
        console.log(error.error.message, "error")
        if(error.status !== 401 || this.isRefreshingToken) {
          return throwError(error);
        }
        console.log("401 Error")
        // In case that user is not logged in we dont need to refresh token
        if (error.status === 401 && (error.error.message === "No user with this email found" || error.error.message === "Wrong password")) {
          return throwError(error);
        }
        
        
        this.isRefreshingToken = true;

        this.authService.refreshToken().pipe(
          catchError((error) => {
            this.authService.sessionExpired();
            return throwError(error);
          }),
        ).subscribe((token) => {
          this.isRefreshingToken = false;
          window.location.reload();
          console.log("error", error)
        })

        return throwError("");
      }
    ));
  }
}