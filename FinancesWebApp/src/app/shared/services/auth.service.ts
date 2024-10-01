import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
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

  private readonly tokenSubject : BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getLoginToken());

  constructor(){
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

    return this.http.post<TokenResult>(`${environment.apiUrl}/api/Auth/refresh`, refreshData).pipe(tap((tokenResult: TokenResult) => 
        this.storeTokenData(tokenResult)
    ));
  }

  public logout(): void {
    this.clearTokens();

    this.router.navigate(['/login']);
  }

  public getAccessTokenObservable(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  public isTokenExpired(token: string): boolean {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  private storeTokenData(tokenResult: TokenResult): void {
    localStorage.setItem('loginToken', tokenResult.accessToken);
    localStorage.setItem('refreshToken', tokenResult.refreshToken);
    localStorage.setItem('userObjectId',tokenResult.userId);
  }

  public clearTokens(): void {
    localStorage.removeItem('loginToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userObjectId');
    this.tokenSubject.next(null);
  }

  public getLoginToken(): string | null {
    return localStorage.getItem("loginToken");
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  public register(registerData: Register): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/register`, registerData);
  }
}
