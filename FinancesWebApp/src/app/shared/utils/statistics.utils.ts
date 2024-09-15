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
}