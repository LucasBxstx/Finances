import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Login, Register, TokenResult } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userObjectId: string;

  private readonly http = inject(HttpClient);

  constructor(){
    this.userObjectId = localStorage.getItem('userObjectId') ?? '';
  }

  public login(loginData: Login): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/api/Auth/login`, loginData).pipe(tap((tokenResult: TokenResult) => {
      localStorage.setItem('loginToken', tokenResult.accessToken);
      localStorage.setItem('refreshToken', tokenResult.refreshToken);
      localStorage.setItem('userObjectId',tokenResult.userId);

      this.userObjectId = tokenResult.userId;

      return tokenResult;
    }));
  }

  public register(registerData: Register): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/register`, registerData);
  }
}
