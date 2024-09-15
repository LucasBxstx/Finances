import { Component, Input, OnInit } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsModule, NgIf],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }), // Dynamisches Laden von ECharts
    }
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() public chartOptions: EChartsOption | null = null;  

}
