import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { TransactionService } from '../shared/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { AddOrEditTransaction, GroupedTransaction, TransactionType, TransactionView, keyMetricData } from '../shared/models/transaction';
import { calculateFirstAndLastDayOfMonth, calculateMonthlyKeyMetricData, compareDates, getListOfAvailableMonthsPerYear, getListOfAvailableYears, mapTrasactionsToDateGroups } from '../shared/utils/transactions.utils';
import { MonthlyOverviewComponent } from './monthly-overview/monthly-overview.component';
import { GetDatePipe } from '../shared/pipes/getDate.pipe';
import { GetPriceDecimalPipe } from '../shared/pipes/getPriceDecimal.pipe';
import { TransactionComponent } from './transaction/transaction.component';
import { AddOrEditTransactionComponent } from './add-or-edit-transaction/add-or-edit-transaction.component';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { AuthService } from '../shared/services/auth.service';

export type pageType = 'transactions' | 'statistics';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NgClass, AsyncPipe, DropMenuComponent, NgFor, NgIf, MonthlyOverviewComponent, GetDatePipe, GetPriceDecimalPipe, TransactionComponent, AddOrEditTransactionComponent, SpinnerComponent],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss'
})
export class TransactionsPageComponent implements OnDestroy {
  public TransactionType = TransactionType;

  private unsubscribe = new Subject<void>();
  public refreshTransactions = new BehaviorSubject<null>(null);
  public currentAddedOrEditedTransaction = new BehaviorSubject<AddOrEditTransaction | null>(null);
  public showSpinner = true;

  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  private readonly selectedMonthStartAndEndDate$ = combineLatest([this.selectedYear$, this.selectedMonth$])
    .pipe(map(([year, month]) => calculateFirstAndLastDayOfMonth(year, month)));

  private readonly transactionData$: Observable<TransactionView> = this.refreshTransactions.pipe(
    switchMap(() => {
      return this.selectedMonthStartAndEndDate$.pipe(
        switchMap(({ firstDayOfMonth, lastDayOfMonth }) => {
          return this.transactionService.getTransactions(this.authService.userObjectId, firstDayOfMonth, lastDayOfMonth);
        }));
    })
  );

  public readonly transactions$: Observable<GroupedTransaction[]> = this.transactionData$.pipe(
    map(({ transactions }) => mapTrasactionsToDateGroups(transactions)),
    tap(() => this.showSpinner = false));

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
    combineLatest([this.selectedYear$, this.selectedMonth$]).pipe(takeUntil(this.unsubscribe)).subscribe(([year, month]) => {
      this.router.navigate([`/${page}`], {
        queryParams: {
          year: year, month: month,
        }
      });
    })
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

  public addTransaction(type: TransactionType): void {
    this.currentAddedOrEditedTransaction.next({
      useCase: 'add',
      transactionId: null,
      transactionType: type,
    });
  }

  public editTransaction(editData: AddOrEditTransaction) {
    this.currentAddedOrEditedTransaction.next(editData);
  }

  public closeAddOrEditWindow(): void {
    this.currentAddedOrEditedTransaction.next(null);
    this.refreshTransactions.next(null);
    this.showSpinner = true;
  }
}
