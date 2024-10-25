import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Label } from '../models/label';
import { environment } from '../../../environments/environment';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private readonly http = inject(HttpClient);

  public getLabel(labelId: number): Observable<Label> {
    return this.http.get<Label>(`${environment.apiUrl}/api/Label?id=${labelId}`);
  }

  public getLabels(): Observable<Label[] | null> {
    return this.http.get<Label[]>(`${environment.apiUrl}/api/Label/all`).pipe(
      catchError((error) => {
        console.log('Error fetching labels:', error);
        return of(null);
      })
    );
  }

  public createOrUpdateLabel(label: Label): Observable<Label> {
    return this.http.put<Label>(`${environment.apiUrl}/api/Label`, label)
  }

  public deleteLabel(labelId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Label?Id=${labelId}`)
  }
}
