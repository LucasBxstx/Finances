import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class ChartComponent implements OnChanges{
  @Input() public chartOptions: EChartsOption | null = null;  
  @Input() public errorMessage: string = "No Entries available";

  public isDataEmpty: boolean = true;

  public ngOnChanges(changes: SimpleChanges): void {
    if('chartOptions' in changes) this.checkIfDataIsEmpty()
  }

  private checkIfDataIsEmpty(): void {
    if (this.chartOptions && this.chartOptions.series) {
      if (Array.isArray(this.chartOptions.series)) {
        const hasData = this.chartOptions.series.some((seriesItem: any) => {
          return seriesItem.data && seriesItem.data.length > 0;
        });
  
        this.isDataEmpty = !hasData;
      } else {
        const seriesItem = this.chartOptions.series as any;
        this.isDataEmpty = !(seriesItem.data && seriesItem.data.length > 0);
      }
    } else {
      this.isDataEmpty = true;
    }
  }
}
