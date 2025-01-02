import { Component, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, of, shareReplay, switchMap, takeUntil, } from 'rxjs';
import { TransactionService } from '../shared/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { AddOrEditTransaction, GroupedTransaction, TransactionType, TransactionView, keyMetricData } from '../shared/models/transaction';
import { calculateFirstAndLastDayOfMonth, calculateMonthlyKeyMetricData, getListOfAvailableMonthsPerYear, getListOfAvailableYears, mapTrasactionsWithLabelsToDateGroups } from '../shared/utils/transactions.utils';
import { MonthlyOverviewComponent } from './monthly-overview/monthly-overview.component';
import { GetDatePipe } from '../shared/pipes/getDate.pipe';
import { TransactionComponent } from './transaction/transaction.component';
import { AddOrEditTransactionComponent } from './add-or-edit-transaction/add-or-edit-transaction.component';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { LogoutComponent } from "../shared/components/logout/logout.component";
import { TranslocoDirective } from '@ngneat/transloco';
import { HttpErrorResponse } from '@angular/common/http';
import { Label } from '../shared/models/label';
import { LabelService } from '../shared/services/label.service';
import { ImportCSVFileComponent } from './import-csvfile/import-csvfile.component';

export type pageType = 'transactions' | 'statistics';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NgClass, AsyncPipe, DropMenuComponent, NgFor, NgIf, MonthlyOverviewComponent, TranslocoDirective, GetDatePipe, TransactionComponent, AddOrEditTransactionComponent, SpinnerComponent, LogoutComponent, ImportCSVFileComponent],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss'
})
export class TransactionsPageComponent implements OnDestroy {
  public TransactionType = TransactionType;

  private unsubscribe = new Subject<void>();
  public refreshTransactions$ = new BehaviorSubject<null>(null);
  public currentAddedOrEditedTransaction$ = new BehaviorSubject<AddOrEditTransaction | null>(null);
  public selectedTransactionsIds$ = new BehaviorSubject<number[]>([]);

  public showLoadingSpinner = true;
  public showNoTransactionsError = false;
  public showLoadingError = false;
  public showImportCSVWindow = false;
  public transactionsSelectable = false;
  public selectAll = false;

  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  private readonly selectedMonthStartAndEndDate$ = combineLatest([this.selectedYear$, this.selectedMonth$])
    .pipe(map(([year, month]) => calculateFirstAndLastDayOfMonth(year, month)));

  private readonly transactionData$: Observable<TransactionView | null> = combineLatest([this.refreshTransactions$, this.selectedMonthStartAndEndDate$])
    .pipe(
      switchMap(([refresh, { firstDayOfMonth, lastDayOfMonth }]) => {
        return this.transactionService.getTransactions(firstDayOfMonth, lastDayOfMonth).pipe(
          map((transactionData) => {
            this.showNoTransactionsError = transactionData?.transactions.length === 0;

            return transactionData;
          }),
          catchError((error: HttpErrorResponse) => {
            this.showLoadingError = true;

            return of(null);
          }))
      }),
      shareReplay(1)
    );

  private readonly labels$: Observable<Label[] | null> = this.refreshTransactions$.pipe(switchMap(() => {
    return this.labelService.getLabels().pipe(
      catchError((error: HttpErrorResponse) => {
        this.showLoadingError = true;

        return of(null);
      }
      ));
  }));

  public readonly transactionsWithLabels$: Observable<GroupedTransaction[] | null> = combineLatest([this.transactionData$, this.labels$]).pipe((
    map(([transactionData, labels]) => {
      this.showLoadingSpinner = false;
      if (!transactionData || !labels) return null;

      return mapTrasactionsWithLabelsToDateGroups(transactionData.transactions, labels);
    })));

  private readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(
    map((transactionData) => transactionData?.oldestTransactionDate ?? null));

  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears));

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );

  public readonly numberOfSelectedTransactions$: Observable<number> = this.selectedTransactionsIds$.pipe(map((selected) => selected.length));

  public readonly monthlyKeyMetrics$: Observable<keyMetricData | null> = this.transactionData$.pipe(
    map((transactionData) => {
      if (!transactionData) return null;

      return calculateMonthlyKeyMetricData(transactionData.transactions, transactionData.priorBalance)

    }));

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

      this.stopSelectionMode();
    })
  }

  public changeMonth(month: number): void {
    this.selectedYear$.pipe(takeUntil(this.unsubscribe)).subscribe((selectedYear) => {
      this.router.navigate([], {
        queryParams: {
          year: selectedYear, month: month,
        }
      });

      this.stopSelectionMode();
    })
  }

  public addTransaction(type: TransactionType): void {
    this.currentAddedOrEditedTransaction$.next({
      useCase: 'add',
      transactionId: null,
      transactionType: type,
    });
  }

  public editTransaction(editData: AddOrEditTransaction) {
    this.currentAddedOrEditedTransaction$.next(editData);
  }

  public transactionDeleted(): void {
    this.refreshTransactions$.next(null);
  }

  public closeAddOrEditWindow(): void {
    this.currentAddedOrEditedTransaction$.next(null);
    this.refreshTransactions$.next(null);
    this.showLoadingSpinner = true;
  }

  public handleSelectableButton(): void {
    this.transactionsSelectable = !this.transactionsSelectable;

    if (this.transactionsSelectable) {
      return
    };

    this.stopSelectionMode();
  }

  private stopSelectionMode(): void {
    this.transactionsSelectable = false;
    this.selectedTransactionsIds$.next([]);
    this.selectAll = false;
  }

  public onSelectChanged(transactionId: number, isSelected: boolean): void {
    const selectedIds = this.selectedTransactionsIds$.getValue();

    if (isSelected) {
      selectedIds.push(transactionId);
      this.selectedTransactionsIds$.next(selectedIds);
      console.log(this.selectedTransactionsIds$.getValue(), selectedIds, "current list")

      return;
    }

    const filteredIds = selectedIds.filter((id) => id !== transactionId);
    this.selectedTransactionsIds$.next(filteredIds); console.log(this.selectedTransactionsIds$.getValue(), "current list")
  }

  public onSelectAll(): void {
    this.selectAll = !this.selectAll;

    if (!this.selectAll) {
      this.selectedTransactionsIds$.next([]);
      return;
    }

    this.transactionData$.pipe(takeUntil(this.unsubscribe), map((transactionData) =>
      (transactionData?.transactions.map((transaction) => transaction.id))
    )).subscribe((transactionIds) => {
      this.selectedTransactionsIds$.next(transactionIds ?? []);
    });

  }

  public refreshPage(): void {
    window.location.reload();
  }
}
