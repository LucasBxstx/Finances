import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);

  public deleteUser(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/ApplicationUser`);
  }
}
