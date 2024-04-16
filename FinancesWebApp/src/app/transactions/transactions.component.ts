import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subject, combineLatest, map, switchMap, takeUntil } from 'rxjs';
import { TransactionService } from '../shared/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { Transaction, TransactionType, TransactionView, keyMetricData } from '../shared/models/transaction';
import { calculateFirstAndLastDayOfMonth, calculateMonthlyKeyMetricData, getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';
import { MonthlyOverviewComponent } from './monthly-overview/monthly-overview.component';

export type pageType = 'transactions' | 'statistics';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [NgClass, AsyncPipe, DropMenuComponent, NgFor, NgIf, MonthlyOverviewComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnDestroy {
  private unsubscribe = new Subject<void>();
  private readonly transactionService = inject(TransactionService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  private readonly selectedMonthStartAndEndDate$ = combineLatest([this.selectedYear$, this.selectedMonth$])
    .pipe(map(([year, month]) => calculateFirstAndLastDayOfMonth(year, month)));

  private readonly transactionData$: Observable<TransactionView> = this.selectedMonthStartAndEndDate$.pipe(
    switchMap(({ firstDayOfMonth, lastDayOfMonth }) => {
      return this.transactionService.getTransactions('6104cf02-6adf-45da-8e0b-f32946e3cf13', firstDayOfMonth, lastDayOfMonth);
    }));

  public readonly transactions$: Observable<Transaction[]> = this.transactionData$.pipe(
    map((transactionData) => transactionData.transactions));

  private readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(
    map((transactionData) => transactionData.oldestTransactionDate));

  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears));

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );

  public readonly monthlyKeyMetrics$: Observable<keyMetricData> = this.transactionData$.pipe(
    map(({ transactions, priorBalance }) => calculateMonthlyKeyMetricData(transactions, priorBalance)));

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public navigateTo(page: pageType): void {
    this.router.navigate([`/${page}`]);
  }

  public changeYear(year: number): void {
    this.selectedMonth$.pipe(takeUntil(this.unsubscribe)).subscribe((selectedMonth) => {
      this.router.navigate([], {
        queryParams: {
          year: year, month: selectedMonth,
        }
      });
    })
  }

  public changeMonth(month: number): void {
    this.selectedYear$.pipe(takeUntil(this.unsubscribe)).subscribe((selectedYear) => {
      this.router.navigate([], {
        queryParams: {
          year: selectedYear, month: month,
        }
      });
    })
  }
}
