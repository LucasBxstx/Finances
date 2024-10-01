import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Transaction, TransactionView } from '../models/transaction';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);

  public getTransaction(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${environment.apiUrl}/api/Transaction?id=${transactionId}`);
  }

  public getTransactions(startDate: Date | null = null, endDate: Date | null = null): Observable<TransactionView | null> {
    // if startDate and endDate are null, the request will get all transactions
    if (startDate && endDate) {
      return this.http.get<TransactionView>(`${environment.apiUrl}/api/Transaction/all?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .pipe(
        catchError((error) => {
          console.log('Error fetching transactions:', error);
          return of(null);
        })
      );
    }
    else {
      return this.http.get<TransactionView>(`${environment.apiUrl}/api/Transaction/all`)
      .pipe(
        catchError((error) => {
          console.log('Error fetching transactions:', error);
          return of(null);
        })
      );;
    }
  }

  public createOrUpdateTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${environment.apiUrl}/api/Transaction`, transaction)
  }

  public deleteTransaction(transactionId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Transaction?Id=${transactionId}`);
  }
}
