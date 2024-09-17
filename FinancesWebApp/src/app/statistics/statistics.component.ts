import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pageType } from '../transactions/transactions-page.component';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { BehaviorSubject, Observable, Subject, combineLatest, map, of, takeUntil } from 'rxjs';
import { getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';
import { TransactionType, TransactionView } from '../shared/models/transaction';
import { TransactionService } from '../shared/services/transaction.service';
import { MonthlyCategoryStatisticComponent } from './monthly-category-statistic/monthly-category-statistic.component';
import { AllMonthCategoryData, BarChartData, MonthTransactionGroup } from '../shared/models/statistics';
import { LabelService } from '../shared/services/label.service';
import { calculateLabelShareData, getCategoryDataOfSelectedYearGroupedByMonth, getTopPricesChatOptions, getTransactionLabelShareCountPieChartData, getTransactionLabelSharePieChartData, getTransactionsGroupedPerMonth, getTransactionsTopExpenseOrIncome } from '../shared/utils/statistics.utils';
import { ChartComponent } from "./chart/chart.component";
import { EChartsOption } from 'echarts';
import { GetMonthPipe } from '../shared/pipes/getMonth.pipe';
import { InteractiveTableChartComponent } from "./interactive-table-chart/interactive-table-chart.component";
import { Label } from '../shared/models/label';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgClass, DropMenuComponent, AsyncPipe, MonthlyCategoryStatisticComponent, ChartComponent, GetMonthPipe, InteractiveTableChartComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {;
  private unsubscribe = new Subject<void>();

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transactionService = inject(TransactionService);
  private readonly labelService = inject(LabelService);
  
  public readonly selectedYear$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['year']));
  public readonly selectedMonth$: Observable<number> = this.activatedRoute.queryParams.pipe(map((params) => params['month']));

  private readonly labels$: Observable<Label[]> = this.labelService.getLabels('6104cf02-6adf-45da-8e0b-f32946e3cf13');

  private readonly transactionData$: Observable<TransactionView> = this.transactionService.getTransactions('6104cf02-6adf-45da-8e0b-f32946e3cf13');

  private readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(
    map((transactionData) => transactionData.oldestTransactionDate));
    
  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears));

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );
  private readonly transactionsGroupedByYearAndMonth$: Observable<MonthTransactionGroup[]> = this.transactionData$
    .pipe(map((transactionData) => getTransactionsGroupedPerMonth(transactionData.transactions)));

  private readonly transactionsOfThisYearGroupedByMonth$: Observable<MonthTransactionGroup[]> = combineLatest([this.selectedYear$, this.transactionsGroupedByYearAndMonth$]).pipe(
    map(([selectedYear, transactionGroups]) =>
      transactionGroups.filter((group) => group.year.toString() === selectedYear.toString())
    ));

  public readonly categoryDataOfSelectedYearGroupedByMonth$: Observable<AllMonthCategoryData> = combineLatest([
      this.labels$,
      this.transactionsOfThisYearGroupedByMonth$
    ]).pipe(map(([labels, transactionsGroupedByMonth]) => getCategoryDataOfSelectedYearGroupedByMonth(labels, transactionsGroupedByMonth)));

  public pieChartSelectedStartMonth$ = new BehaviorSubject<number>(1);

  public pieChartSelectedEndMonth$ = new BehaviorSubject<number>(12);

  private readonly labelShareDateStartFilter$ = combineLatest([this.pieChartSelectedStartMonth$, this.selectedYear$])
    .pipe(map(([selectedStartMonth, selectedYear])=> new Date(selectedYear, selectedStartMonth - 1, 1)));

  private readonly labelShareDateEndFilter$ = combineLatest([this.pieChartSelectedEndMonth$, this.selectedYear$])
    .pipe(map(([selectedEndMonth, selectedYear])=> new Date(selectedYear, selectedEndMonth - 1, 31)));

  private readonly filteredTransactions$ = combineLatest([
    this.transactionData$,
    this.labelShareDateStartFilter$, 
    this.labelShareDateEndFilter$
  ]).pipe(map(([transactionData, startDate, endDate]) => {
    var filteredTransactions = transactionData.transactions.filter((t) => new Date(t.date) <= endDate && new Date(t.date) >= startDate);

    return filteredTransactions;
  }))

  private readonly labelShare$ = combineLatest([
      this.filteredTransactions$,
      this.labels$, 
    ]).pipe(map(([transactions, labels]) => calculateLabelShareData(transactions, labels)));

  public readonly labelSharePrice$: Observable<EChartsOption> = this.labelShare$.pipe(map(getTransactionLabelSharePieChartData));

  public readonly labelShareCount$: Observable<EChartsOption> = this.labelShare$.pipe(map(getTransactionLabelShareCountPieChartData));

  public readonly topExpenses$: Observable<EChartsOption> = combineLatest([this.filteredTransactions$, this.labels$]).pipe(map(([transactions, labels])=>{
    const topExpenses = getTransactionsTopExpenseOrIncome(transactions, labels, TransactionType.Expense);
    const chartOptions = getTopPricesChatOptions(topExpenses, TransactionType.Expense);

    return chartOptions;
  }));

  public readonly topIncomes$: Observable<EChartsOption> = combineLatest([this.filteredTransactions$, this.labels$]).pipe(map(([transactions, labels])=>{
    const topIncomes = getTransactionsTopExpenseOrIncome(transactions, labels, TransactionType.Income);
    const chartOptions = getTopPricesChatOptions(topIncomes, TransactionType.Income);

    return chartOptions;
  }));

    

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
    this.pieChartSelectedStartMonth$.next(month);
  }

  public changePieChartSelectedEndMonth(month:number): void {
    this.pieChartSelectedEndMonth$.next(month);
  }
}
