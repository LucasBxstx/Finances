import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pageType } from '../transactions/transactions-page.component';
import { DropMenuComponent } from '../shared/components/drop-menu/drop-menu.component';
import { Observable, Subject, combineLatest, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { getListOfAvailableMonthsPerYear, getListOfAvailableYears } from '../shared/utils/transactions.utils';
import { TransactionType, TransactionView } from '../shared/models/transaction';
import { TransactionService } from '../shared/services/transaction.service';
import { MonthlyCategoryStatisticComponent } from './monthly-category-statistic/monthly-category-statistic.component';
import { AllMonthCategoryData, LabelWithValues, MonthlyCategoryValues, MonthTransactionGroup } from '../shared/models/statistics';
import { LabelService } from '../shared/services/label.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgClass, DropMenuComponent, AsyncPipe, MonthlyCategoryStatisticComponent],
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

  private readonly transactionsGroupedByYearAndMonth$: Observable<MonthTransactionGroup[]> = this.transactionData$
    .pipe(map((transactionData) => {
      const transactionsGroupedPerMonth: MonthTransactionGroup[] = []
      
      transactionData.transactions.forEach((transaction) => {
        const transactionYear = new Date(transaction.date).getFullYear();
        const transactionMonth =  new Date(transaction.date).getMonth();
        const group = transactionsGroupedPerMonth.find((group) => group.year === transactionYear && group.month === transactionMonth)

        if(!group){
          transactionsGroupedPerMonth.push({
            year: transactionYear,
            month: transactionMonth,
            transactions: [transaction],
          });
        }

        else group.transactions.push(transaction);
      });

      return transactionsGroupedPerMonth;
    }
  ));

  private readonly transactionsOfThisYearGroupedByMonth$: Observable<MonthTransactionGroup[]> = combineLatest([this.selectedYear$, this.transactionsGroupedByYearAndMonth$]).pipe(
    map(([selectedYear, transactionGroups]) =>
      transactionGroups.filter((group) => group.year.toString() === selectedYear.toString())
    ));

  public readonly categoryDataOfSelectedYearGroupedByMonth$: Observable<AllMonthCategoryData> = combineLatest([
      this.labelService.getLabels('6104cf02-6adf-45da-8e0b-f32946e3cf13'),
      this.transactionsOfThisYearGroupedByMonth$
    ]).pipe(map(([labels, transactionsGroupedByMonth]) => {
      // Here transactionsGroupedByMonth contain only transactions of the selected year and are grouped by month.

      const monthlyValuesOverTheYear: MonthlyCategoryValues[] =[];
      // Contains all data for the aggregated label data over all months of the selected year.

      transactionsGroupedByMonth.forEach((monthlyCategoryData) => {
        // Aggregate label data for each month
        var labelWithValues: LabelWithValues[] = [];

        labels.forEach((label)=> {
          labelWithValues.push({
            labelId: label.id,
            sumOfTransactionValues: 0,
            transactionsCount: 0,
          });
        });
        

        monthlyCategoryData.transactions.forEach((transaction)=>{
          // Aggregate prices of the transactions for each label
          const accordingLabelGroup = labelWithValues.find((label) => label.labelId === transaction.labelId);
          
          if (accordingLabelGroup) {
            accordingLabelGroup.sumOfTransactionValues += transaction.price * (transaction.transactionType === TransactionType.Expense ? -1 : 1);
            accordingLabelGroup.transactionsCount ++;
          }
        });

        var totalBilancePerMonthOverAllLabels = 0;
        labelWithValues.forEach((label)=> {
          totalBilancePerMonthOverAllLabels += label.sumOfTransactionValues;
        })
        
        monthlyValuesOverTheYear.push({
          month: monthlyCategoryData.month,
          labelsWithValues: labelWithValues,
          totalBilance: totalBilancePerMonthOverAllLabels,
        });
      });

      const allMonthCategoryData: AllMonthCategoryData = {
        labels: labels,
        monthlyValues: monthlyValuesOverTheYear,
      };

      return allMonthCategoryData;
    }));

  private readonly oldestTransactionDate$: Observable<Date | null> = this.transactionData$.pipe(
    map((transactionData) => transactionData.oldestTransactionDate));
    
  public readonly availableYears$: Observable<number[]> = this.oldestTransactionDate$.pipe(
    map(getListOfAvailableYears));

  public readonly availableMonths$: Observable<number[]> = combineLatest([this.selectedYear$, this.oldestTransactionDate$]).pipe(
    map(([selectedYear, oldestDate]) => getListOfAvailableMonthsPerYear(selectedYear, oldestDate))
  );

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
