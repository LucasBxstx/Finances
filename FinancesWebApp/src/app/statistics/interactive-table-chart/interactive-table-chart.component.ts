import { Component, Input } from '@angular/core';
import { MonthlyCategoryStatisticComponent } from '../monthly-category-statistic/monthly-category-statistic.component';
import { ChartComponent } from '../chart/chart.component';
import { AllMonthCategoryData } from '../../shared/models/statistics';
import { EChartsOption } from 'echarts';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { getMonthString, getTransactionBilanceBarChartData } from '../../shared/utils/statistics.utils';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-interactive-table-chart',
  standalone: true,
  imports: [MonthlyCategoryStatisticComponent, ChartComponent, AsyncPipe],
  templateUrl: './interactive-table-chart.component.html',
  styleUrl: './interactive-table-chart.component.scss'
})
export class InteractiveTableChartComponent {

  @Input() public allMonthCategoryData: AllMonthCategoryData | null = null;

  private readonly selectedLabelId$ = new BehaviorSubject<number| null>(null);

  public readonly chartOptions$: Observable<EChartsOption | null> = this.selectedLabelId$.pipe(map((selectedLabelId)=>{
    if(!this.allMonthCategoryData) return null;

    const months: string[] = [];
    const bilancePerMonth: number[] = [];

    if(!selectedLabelId){
      this.allMonthCategoryData.monthlyValues.forEach((monthData)=>{
        months.push(getMonthString(monthData.month));
        bilancePerMonth.push(monthData.totalBilance);
      })
    }

    else {
      this.allMonthCategoryData.monthlyValues.forEach((monthData) => {
        months.push(getMonthString(monthData.month));
        const selectedLabelData = monthData.labelsWithValues.find((label) => label.labelId === selectedLabelId);

        bilancePerMonth.push(selectedLabelData ? selectedLabelData.sumOfTransactionValues : 0);
      });
    }

    const chartOptions = getTransactionBilanceBarChartData(months, bilancePerMonth);

    return chartOptions;
  }));

  public selectedLabelChanged(labelId: number | null): void {
    this.selectedLabelId$.next(labelId);
  }

}
