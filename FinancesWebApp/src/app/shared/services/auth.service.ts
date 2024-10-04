import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Login, Refresh, Register, TokenResult } from '../models/auth';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public emailAddress: string;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  constructor() {
    this.emailAddress = localStorage.getItem('emailAddress') ?? '';
  }

  public login(loginData: Login): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/api/Auth/login`, loginData).pipe(tap((tokenResult: TokenResult) => {
      this.storeTokenData(tokenResult);
      localStorage.setItem('emailAddress', loginData.email)
      this.emailAddress = loginData.email;

      return tokenResult;
    }));
  }

  public refreshToken(): Observable<TokenResult | null> {
    const refreshToken = this.getRefreshToken();
    const userId = localStorage.getItem("userObjectId");

    if (!refreshToken || !userId) return of(null);

    const refreshData: Refresh = {
      userId: userId,
      refreshToken: refreshToken,
    }

    return this.http.post<TokenResult>(`${environment.apiUrl}/api/Auth/refresh`, refreshData).pipe(
      map((token) => {
        this.storeTokenData(token)

        return token;
      }),
      catchError((error: HttpErrorResponse) => {
        this.sessionExpired();
       
        return throwError(error);
      }
      ));
    }

  public logout(): void {
    this.clearTokens();

    this.router.navigate(['/login']);
  }

  public sessionExpired(): void {
    console.log("session expired")
    this.clearTokens();

    this.router.navigate(['/session-expired']);
  }

  private storeTokenData(tokenResult: TokenResult): void {
    localStorage.setItem('loginToken', tokenResult.accessToken);
    localStorage.setItem('refreshToken', tokenResult.refreshToken);
    localStorage.setItem('userObjectId', tokenResult.userId);
  }

  public clearTokens(): void {
    localStorage.removeItem('loginToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userObjectId');
    localStorage.removeItem('emailAddress');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  public register(registerData: Register): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/register`, registerData);
  }
}
