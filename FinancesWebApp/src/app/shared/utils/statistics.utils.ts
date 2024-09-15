import { EChartsOption } from "echarts";
import { Label } from "../models/label";
import { AllMonthCategoryData, LabelWithValues, MonthlyCategoryValues, MonthTransactionGroup } from "../models/statistics";
import { Transaction, TransactionType } from "../models/transaction";

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

export function getTransactionBilanceBarChartData(months: string[], bilancePerMonth: number[]): EChartsOption {
  return {
    title: {
      text: 'Transaction bilance over the year',
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