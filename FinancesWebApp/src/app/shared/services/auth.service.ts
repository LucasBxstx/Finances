import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Login, Register, TokenResult } from '../models/auth';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public emailAddress: string;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  constructor(){
    this.emailAddress = localStorage.getItem('emailAddress') ?? '';
  }

  public login(loginData: Login): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/api/Auth/login`, loginData).pipe(tap((tokenResult: TokenResult) => {
      localStorage.setItem('loginToken', tokenResult.accessToken);
      localStorage.setItem('refreshToken', tokenResult.refreshToken);
      localStorage.setItem('userObjectId',tokenResult.userId);
      localStorage.setItem('emailAddress', loginData.email)

      this.emailAddress = loginData.email;

      return tokenResult;
    }));
  }

  public logout(): void {
    localStorage.removeItem('loginToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userObjectId');

    this.router.navigate(['/login']);
  }

  public register(registerData: Register): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/register`, registerData);
  }
}
