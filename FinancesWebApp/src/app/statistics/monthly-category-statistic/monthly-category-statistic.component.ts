import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AllMonthCategoryData } from '../../shared/models/statistics';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChartComponent } from "../chart/chart.component";
import { GetMonthPipe } from '../../shared/pipes/getMonth.pipe';
import { GetPriceDecimalPipe } from '../../shared/pipes/getPriceDecimal.pipe';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-monthly-category-statistic',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, GetMonthPipe, NgClass, ChartComponent, GetPriceDecimalPipe, TranslocoDirective],
  templateUrl: './monthly-category-statistic.component.html',
  styleUrl: './monthly-category-statistic.component.scss'
})
export class MonthlyCategoryStatisticComponent {

  @Input() public allMonthCategoryData: AllMonthCategoryData | null = null;
  @Input() public selectedLabelId: number | null = null; // If null the default is showing the transaction bilance of the whole year

  @Output() public selectedLabelChanged: EventEmitter<number | null> = new EventEmitter(); 

  

  
}
