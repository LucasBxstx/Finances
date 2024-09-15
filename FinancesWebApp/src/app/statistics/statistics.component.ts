import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pageType } from '../transactions/transactions-page.component';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { Observable, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';
import { TransactionView } from '../shared/models/transaction';
import { TransactionService } from '../shared/services/transaction.service';
import { MonthlyCategoryStatisticComponent } from './monthly-category-statistic/monthly-category-statistic.component';
import { AllMonthCategoryData, MonthTransactionGroup } from '../shared/models/statistics';
import { LabelService } from '../shared/services/label.service';
import { getCategoryDataOfSelectedYearGroupedByMonth, getMonthString, getTransactionBilanceBarChartData, getTransactionsGroupedPerMonth } from '../shared/utils/statistics.utils';
import { ChartComponent } from "./chart/chart.component";
import { EChartsOption } from 'echarts';
import { GetMonthPipe } from '../shared/pipes/getMonth.pipe';
import { InteractiveTableChartComponent } from "./interactive-table-chart/interactive-table-chart.component";

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
      this.labelService.getLabels('6104cf02-6adf-45da-8e0b-f32946e3cf13'),
      this.transactionsOfThisYearGroupedByMonth$
    ]).pipe(map(([labels, transactionsGroupedByMonth]) => getCategoryDataOfSelectedYearGroupedByMonth(labels, transactionsGroupedByMonth)));


    public readonly transactionBilanceOverYear$: Observable<EChartsOption> = this.categoryDataOfSelectedYearGroupedByMonth$.pipe(map((data)=>{
      const months: string[] = [];
      const bilancePerMonth: number[] = [];
  
      data.monthlyValues.forEach((month)=>{
        months.push(getMonthString(month.month));
        bilancePerMonth.push(month.totalBilance);
      })
  
      const chartOptions = getTransactionBilanceBarChartData(months, bilancePerMonth);
  
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
}
