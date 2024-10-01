import { Component, inject, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { MonthlyCategoryStatisticComponent } from '../monthly-category-statistic/monthly-category-statistic.component';
import { ChartComponent } from '../chart/chart.component';
import { AllMonthCategoryData } from '../../shared/models/statistics';
import { EChartsOption } from 'echarts';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { getMonthString, getTransactionBilanceBarChartData } from '../../shared/utils/statistics.utils';
import { AsyncPipe } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-interactive-table-chart',
  standalone: true,
  imports: [MonthlyCategoryStatisticComponent, ChartComponent, AsyncPipe],
  templateUrl: './interactive-table-chart.component.html',
  styleUrl: './interactive-table-chart.component.scss'
})
export class InteractiveTableChartComponent implements OnChanges {
  private readonly translocoService = inject(TranslocoService);

  @Input() public allMonthCategoryData: AllMonthCategoryData | null = null;

  public readonly selectedLabelId$ = new BehaviorSubject<number| null>(null);

  public readonly chartOptions$: Observable<EChartsOption | null> = this.selectedLabelId$.pipe(map((selectedLabelId)=>{
    if(!this.allMonthCategoryData) return null;

    const months: string[] = [];
    const bilancePerMonth: number[] = [];
    const activeLang = this.translocoService.getActiveLang() as "en" | "de";

    this.allMonthCategoryData.monthlyValues.forEach((monthData)=>{
      months.push(getMonthString(monthData.month, activeLang));

      if(!selectedLabelId) bilancePerMonth.push(monthData.totalBilance);
      else {
          this.allMonthCategoryData!.monthlyValues.forEach((monthData) => {
          const selectedLabelData = monthData.labelsWithValues.find((label) => label.labelId === selectedLabelId);
          bilancePerMonth.push(selectedLabelData ? selectedLabelData.sumOfTransactionValues : 0);
        });
      }
    });


    const label = this.allMonthCategoryData.labels.find((label)=> label.id === selectedLabelId);
    const labelName = label?.name; 
    
    const chartOptions = getTransactionBilanceBarChartData(months, bilancePerMonth, labelName);

    return chartOptions;
  }));

  public ngOnChanges(changes: SimpleChanges): void {
    if('allMonthCategoryData' in changes) this.selectedLabelChanged(null);
  }

  public selectedLabelChanged(labelId: number | null): void {
    this.selectedLabelId$.next(labelId);
  }

}
