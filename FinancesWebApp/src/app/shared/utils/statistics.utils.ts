import { EChartsOption } from "echarts";
import { Label } from "../models/label";
import { AllMonthCategoryData, LabelWithData, LabelWithValues, MonthlyCategoryValues, MonthTransactionGroup, pieChartData } from "../models/statistics";
import { Transaction, TransactionType, TransactionView } from "../models/transaction";

export function getTransactionsGroupedPerMonth(transactions: Transaction[]): MonthTransactionGroup[] {
    const transactionsGroupedPerMonth: MonthTransactionGroup[] = []
      
      transactions.forEach((transaction) => {
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

export function getCategoryDataOfSelectedYearGroupedByMonth(labels: Label[], transactionsGroupedByMonth: MonthTransactionGroup[]) {
    const monthlyValuesOverTheYear: MonthlyCategoryValues[] =[];
      // Contains all data for the aggregated label data over all months of the selected year.

      var labelWithValuesConstruct: LabelWithValues[] = [];
      labels.forEach((label) => labelWithValuesConstruct.push(getLabelWithEmptyValues(label.id)));

      for(let month = 1 ; month <= 12 ; month++){
        monthlyValuesOverTheYear.push({
          month: month,
          labelsWithValues: labelWithValuesConstruct,
          totalBilance: 0,
        });
      }

      transactionsGroupedByMonth.forEach((monthlyCategoryData) => {
        // Aggregate label data for each month
        var labelWithValues: LabelWithValues[] = [];
        labels.forEach((label) => labelWithValues.push(getLabelWithEmptyValues(label.id)));
        
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

        var accordingMonthEntry = monthlyValuesOverTheYear.find((month) => month.month === monthlyCategoryData.month);
        
        if(accordingMonthEntry){
          accordingMonthEntry.labelsWithValues = labelWithValues;
          accordingMonthEntry.totalBilance = totalBilancePerMonthOverAllLabels;
        }
      });

      const allMonthCategoryData: AllMonthCategoryData = {
        labels: labels,
        monthlyValues: monthlyValuesOverTheYear,
      };

      return allMonthCategoryData;
}

export function getLabelWithEmptyValues(labelId: number) {
  return {
    labelId: labelId,
    sumOfTransactionValues: 0,
    transactionsCount: 0,
  }
}

export function getMonthString(monthNumeric: number): string {
  const monthsAlphabetic = ["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"];
  return monthsAlphabetic[monthNumeric -1];
}

export function getTransactionBilanceBarChartData(months: string[], bilancePerMonth: number[], labelName?: string): EChartsOption {
  return {
    title: {
      text: labelName ? `Transaction bilance over the year | Filter: ${labelName}` :'Transaction bilance over the year',
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    xAxis: {
      type: 'category',
      data: months,
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgb(64, 64, 64)',
        }
      }
    },
    series: [
      {
        data: bilancePerMonth,
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const value = params.value as number;
            return (value >= 0 ? 'rgb(13, 163, 13)' : 'rgb(216, 21, 21)');
          }
        }
      }
    ]
  };
}

export function getTransactionLabelSharePieChartData(labelWithData: LabelWithData[]): EChartsOption {
  const pieChartData : pieChartData[] = [];

  console.log('labelWithData',labelWithData)

  labelWithData.forEach((labelData)=>{
    pieChartData.push({
      name: labelData.labelName,
      value: labelData.sumOfTransactionValues,
      itemStyle: {color: labelData.labelColor},
    })
  })
  
  return {
    title: {
      text: 'Label share of all transactions',
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: pieChartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'normal',
            color: 'white',             // Schriftfarbe
            textBorderColor: 'transparent',  // Umrandungsfarbe auf transparent setzen
            textBorderWidth: 0,         // Umrandungsbreite auf 0 setzen
            textShadowColor: 'none',    // Kein Schatten
            textShadowBlur: 0,           // Schattenunschärfe auf 0 setzen
            
          }
        }
      }
    ]
  };
}

export function calculateLabelShareData(transactionData: TransactionView, labels: Label[]){
  const labelsWithValues: LabelWithData[] = []

  transactionData.transactions.forEach((transaction)=>{
    if (transaction.transactionType !== TransactionType.Expense || transaction.labelId === null) return;

    const accordingLabelGroup = labelsWithValues.find((entry)=>entry.labelId === transaction.labelId);

    if (accordingLabelGroup) {
      accordingLabelGroup.sumOfTransactionValues += transaction.price;
      accordingLabelGroup.transactionsCount ++;
    }

    else {
      const labelData = labels.find((label)=> label.id === transaction.labelId);
      const labelName = labelData?.name ?? 'error';
      const labelColor = labelData?.color ?? 'grey';

      labelsWithValues.push({
        labelId: transaction.labelId,
        labelName: labelName,
        labelColor: labelColor,
        sumOfTransactionValues: transaction.price,
        transactionsCount: 1,
      })
    }
  });

  return labelsWithValues;
}