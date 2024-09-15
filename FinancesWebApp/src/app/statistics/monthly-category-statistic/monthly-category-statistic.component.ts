import { Component, Input } from '@angular/core';
import { AllMonthCategoryData } from '../../shared/models/statistics';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { GetMonthPipe } from '../../shared/pipes/getMonth.pipe';

@Component({
  selector: 'app-monthly-category-statistic',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, GetMonthPipe, NgClass],
  templateUrl: './monthly-category-statistic.component.html',
  styleUrl: './monthly-category-statistic.component.scss'
})
export class MonthlyCategoryStatisticComponent {

  @Input() public allMonthCategoryData: AllMonthCategoryData | null = null;
}
