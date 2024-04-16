import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subject, combineLatest, map, switchMap, takeUntil } from 'rxjs';
import { TransactionService } from '../shared/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { Transaction, TransactionView } from '../shared/models/transaction';
import { getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';

export type pageType = 'transactions' | 'statistics';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [NgClass, AsyncPipe, DropMenuComponent, NgFor, NgIf],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnDestroy {
  private unsubscribe = new Subject<void>();
  private readonly transactionService = inject(TransactionService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly availableMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  private readonly daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  private readonly selectedMonthStartAndEndDate$ = combineLatest([this.selectedYear$, this.selectedMonth$])
    .pipe(map(([year, month]) => {
      const startDateString = `${year}-${month}-02`;
      const endDateString = `${year}-${month}-${this.daysPerMonth[month - 1]}`;
      const firstDayOfMonth = new Date(startDateString);
      const lastDayOfMonth = new Date(endDateString);

      lastDayOfMonth.setHours(23);
      lastDayOfMonth.setMinutes(59);

      return { firstDayOfMonth, lastDayOfMonth };
    }
    ));

  public readonly transactionData$: Observable<TransactionView> = this.selectedMonthStartAndEndDate$.pipe(
    switchMap(({ firstDayOfMonth, lastDayOfMonth }) => {
      return this.transactionService.getTransactions('6104cf02-6adf-45da-8e0b-f32946e3cf13', firstDayOfMonth, lastDayOfMonth);
    }
    ));

  public readonly transactions$: Observable<Transaction[]> = this.transactionData$.pipe(map((transactionData) => transactionData.transactions));

  public readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(map((transactionData) => transactionData.oldestTransactionDate));

  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears)
  );

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );

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
