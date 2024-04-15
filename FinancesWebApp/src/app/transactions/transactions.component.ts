import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, filter, map, startWith, takeUntil } from 'rxjs';
import { TransactionService } from '../shared/services/transaction.service';
import { NavigationEnd, Router } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';

export type pageType = 'transactions' | 'statistics';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [NgClass, AsyncPipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();
  private readonly transactionService = inject(TransactionService);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    // this.transactionService.getTransaction(4).pipe(takeUntil(this.unsubscribe)).subscribe((transaction) => {
    //   console.log(transaction);
    // });

    let startDate = new Date('2024-03-06');
    let endDate = new Date('2024-03-08');

    this.transactionService.getTransactions('6104cf02-6adf-45da-8e0b-f32946e3cf13', startDate, endDate).pipe(takeUntil(this.unsubscribe)).subscribe((transactions) => {
      console.log(transactions);
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public navigateTo(page: pageType): void {
    this.router.navigate([`/${page}`]);
  }

}
