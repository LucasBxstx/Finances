import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Login, Register, TokenResult } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated = false;

  private readonly http = inject(HttpClient);

  public login(loginData: Login): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/login`, loginData).pipe(tap((tokenResult: TokenResult) => {
      localStorage.setItem('loginToken', tokenResult.accessToken);
      localStorage.setItem('refreshToken', tokenResult.refreshToken);
      this.isAuthenticated = true;

      return tokenResult;
    }));
  }

  public register(registerData: Register): Observable<TokenResult> {
    return this.http.post<TokenResult>(`${environment.apiUrl}/register`, registerData);
  }
}
