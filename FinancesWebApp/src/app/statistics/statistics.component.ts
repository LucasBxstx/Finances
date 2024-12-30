import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pageType } from '../transactions/transactions-page.component';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, of, shareReplay, startWith, takeUntil } from 'rxjs';
import { getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';
import { Transaction, TransactionType, TransactionView } from '../shared/models/transaction';
import { TransactionService } from '../shared/services/transaction.service';
import { MonthlyCategoryStatisticComponent } from './monthly-category-statistic/monthly-category-statistic.component';
import { AllMonthCategoryData, ErrorMessages, LabelWithData, MonthTransactionGroup } from '../shared/models/statistics';
import { LabelService } from '../shared/services/label.service';
import { calculateAccountBalanceTimeData, calculateExpensesLabelStackTimeData, calculateLabelShareData, convertToCSV, getAccountBalanceTimeLineChartData, getCategoryDataOfSelectedYearGroupedByMonth, getExpensesLabelStackTimeData, getTopPricesChatOptions, getTransactionLabelShareCountPieChartData, getTransactionLabelSharePieChartData, getTransactionsGroupedPerMonth, getTransactionsTopExpenseOrIncome } from '../shared/utils/statistics.utils';
import { ChartComponent } from "./chart/chart.component";
import { EChartsOption } from 'echarts';
import { GetMonthPipe } from '../shared/pipes/getMonth.pipe';
import { InteractiveTableChartComponent } from "./interactive-table-chart/interactive-table-chart.component";
import { Label } from '../shared/models/label';
import { LogoutComponent } from "../shared/components/logout/logout.component";
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { TranslocoDirective } from '@ngneat/transloco';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgClass, DropMenuComponent, AsyncPipe, MonthlyCategoryStatisticComponent, ChartComponent, GetMonthPipe, InteractiveTableChartComponent, LogoutComponent, NgIf, SpinnerComponent, TranslocoDirective],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  public ErrorMessages = ErrorMessages;

  private unsubscribe = new Subject<void>();
  public filterStartMonth$ = new BehaviorSubject<number>(1);
  public filterEndMonth$ = new BehaviorSubject<number>(12);
  
  public showLoadingError = false;
  public showNoTransactionsError = false;
  public showNoLabelsError = false;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  
  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  public readonly labels$: Observable<Label[] | null> = this.labelService.getLabels().pipe(
    map((labels) => {
      this.showNoLabelsError = labels?.length === 0;

      return labels;
    }),
    catchError((error: HttpErrorResponse) => {
      this.showLoadingError = true;
      
      return of(null);
    }),
    shareReplay(1)
  );

  public readonly transactionData$: Observable<TransactionView | null> = this.transactionService.getTransactions().pipe(
    map((transactionsData) => {
      this.showNoTransactionsError = transactionsData?.transactions.length === 0;

      return transactionsData;
    }),
    catchError((error: HttpErrorResponse) => {
      this.showLoadingError = true;

      return of(null);
    }),
    shareReplay(1)
  );

  public readonly accountBalanceTimeData$: Observable<EChartsOption> = this.transactionData$.pipe(map((transactionData)=>{
    const accountBalanceTimeData = calculateAccountBalanceTimeData(transactionData?.transactions ?? [], transactionData?.priorBalance ?? 0);
    const chartData = getAccountBalanceTimeLineChartData(accountBalanceTimeData);

    return chartData;
  }))

  public readonly expensesLabelStackTimeData$: Observable<EChartsOption> = combineLatest([this.transactionData$, this.labels$]) .pipe(map(([transactionData, labels]) => {
    const expensesLabelStackTimeData = calculateExpensesLabelStackTimeData(transactionData?.transactions ?? [], labels ?? [], transactionData?.oldestTransactionDate);
    const chartData = getExpensesLabelStackTimeData(expensesLabelStackTimeData);

    return chartData;
  }));

  private readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(
    map((transactionData) => transactionData?.oldestTransactionDate ?? null));
    
  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears));

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );
  private readonly transactionsGroupedByYearAndMonth$: Observable<MonthTransactionGroup[]> = this.transactionData$
    .pipe(map((transactionData) => {
      if(transactionData?.transactions) return getTransactionsGroupedPerMonth(transactionData.transactions);
      else return getTransactionsGroupedPerMonth([]);
    }));

  private readonly transactionsOfThisYearGroupedByMonth$: Observable<MonthTransactionGroup[]> = combineLatest([this.selectedYear$, this.transactionsGroupedByYearAndMonth$]).pipe(
    map(([selectedYear, transactionGroups]) =>
      transactionGroups.filter((group) => group.year.toString() === selectedYear.toString())
    ));

  public readonly categoryDataOfSelectedYearGroupedByMonth$: Observable<AllMonthCategoryData> = combineLatest([
      this.labels$,
      this.transactionsOfThisYearGroupedByMonth$
    ]).pipe(map(([labels, transactionsGroupedByMonth]) => getCategoryDataOfSelectedYearGroupedByMonth(labels ?? [], transactionsGroupedByMonth)));

  private readonly startDateFilter$ = combineLatest([this.filterStartMonth$, this.selectedYear$])
    .pipe(map(([selectedStartMonth, selectedYear])=> new Date(selectedYear, selectedStartMonth - 1, 1)));

  private readonly endDateFilter$ = combineLatest([this.filterEndMonth$, this.selectedYear$])
    .pipe(map(([selectedEndMonth, selectedYear])=> new Date(selectedYear, selectedEndMonth - 1, 31)));

  private readonly filteredTransactions$: Observable<Transaction[]> = combineLatest([
    this.transactionData$,
    this.startDateFilter$, 
    this.endDateFilter$
  ]).pipe(map(([transactionData, startDate, endDate]) => {
    if (!transactionData) return []

    return transactionData.transactions.filter((t) => new Date(t.date) <= endDate && new Date(t.date) >= startDate); 
  }));

  private readonly labelShare$: Observable<LabelWithData[]> = combineLatest([
      this.filteredTransactions$,
      this.labels$, 
    ]).pipe(map(([transactions, labels]) => calculateLabelShareData(transactions, labels ?? [])));

  public readonly labelSharePrice$: Observable<EChartsOption> = this.labelShare$.pipe(map(getTransactionLabelSharePieChartData));

  public readonly labelShareCount$: Observable<EChartsOption> = this.labelShare$.pipe(map(getTransactionLabelShareCountPieChartData));

  public readonly topExpenses$: Observable<EChartsOption> = combineLatest([this.filteredTransactions$, this.labels$]).pipe(map(([transactions, labels]) => {
    const topExpenses = getTransactionsTopExpenseOrIncome(transactions, labels ?? [], TransactionType.Expense);
    const chartOptions = getTopPricesChatOptions(topExpenses, TransactionType.Expense);

    return chartOptions;
  }));

  public readonly topIncomes$: Observable<EChartsOption> = combineLatest([this.filteredTransactions$, this.labels$]).pipe(map(([transactions, labels])=>{
    const topIncomes = getTransactionsTopExpenseOrIncome(transactions, labels ?? [], TransactionType.Income);
    const chartOptions = getTopPricesChatOptions(topIncomes, TransactionType.Income);

    return chartOptions;
  }));

  public readonly showSpinner$: Observable<boolean> = combineLatest([
    this.categoryDataOfSelectedYearGroupedByMonth$,
    this.labelSharePrice$,
    this.labelShareCount$,
    this.topExpenses$,
    this.topIncomes$,
  ]).pipe(
      map(()=> false),
      shareReplay(1),
      startWith(true));

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

  public changePieChartSelectedStartMonth(month:number): void {
    this.filterStartMonth$.next(month);
  }

  public changePieChartSelectedEndMonth(month:number): void {
    this.filterEndMonth$.next(month);
  }

  public exportTransactionToCSV(): void {
    combineLatest([this.transactionData$, this.labels$])
    .pipe(
      takeUntil(this.unsubscribe)
    ).subscribe(([transactionData, labels]) => {
        if(!transactionData?.transactions) return;
        
        const csvData = convertToCSV(transactionData.transactions, labels ?? []);
        this.downloadCSV(csvData);
      })
  }

  private downloadCSV(csv: string): void {
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    const today = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
    a.setAttribute('href', url);
    a.setAttribute('download', `MyFinanceStats Transactions ${today}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  public refreshPage(): void {
    window.location.reload();
  }
}
