import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Label } from '../models/label';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private readonly http = inject(HttpClient);

  public getLabel(userId: string, labelId: number): Observable<Label> {
    return this.http.get<Label>(`${environment.apiUrl}/api/Label?userId=${userId}&id=${labelId}`);
  }

  public getLabels(userId: string): Observable<Label[]> {
    return this.http.get<Label[]>(`${environment.apiUrl}/api/Label/all?userId=${userId}`);
  }

  public createOrUpdateLabel(label: Label): Observable<Label> {
    return this.http.put<Label>(`${environment.apiUrl}/api/Label`, label)
  }
}
