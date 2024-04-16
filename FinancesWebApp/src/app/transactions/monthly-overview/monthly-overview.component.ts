import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GetMonthPipe } from '../../shared/pipes/getMonth.pipe';
import { TransactionView, keyMetricData } from '../../shared/models/transaction';
import { GetRoundedNumber } from '../../shared/pipes/getRoundedNumber';

@Component({
  selector: 'app-monthly-overview',
  standalone: true,
  imports: [NgIf, GetMonthPipe, NgClass, GetRoundedNumber],
  templateUrl: './monthly-overview.component.html',
  styleUrl: './monthly-overview.component.scss'
})
export class MonthlyOverviewComponent {

  @Input({required: true}) public currentMonth!: number | null;
  @Input({required: true}) public keyMetricData!: keyMetricData | null; 


}
