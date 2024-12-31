import { EChartsOption } from "echarts";
import { Label } from "../models/label";
import { AccountBalanceTimeData, AllMonthCategoryData, BarChartData, HistogramData, LabelStackGraphData, LabelWithData, LabelWithValues, LabelWithYearlyData, MonthlyCategoryValues, MonthTransactionGroup, PieChartData, SumOfExpensePerYearAndMonth, YearsAndMonth } from "../models/statistics";
import { Transaction, TransactionType, TransactionView } from "../models/transaction";
import * as echarts from 'echarts';

export function getTransactionsGroupedPerMonth(transactions: Transaction[]): MonthTransactionGroup[] {
  const transactionsGroupedPerMonth: MonthTransactionGroup[] = []

  transactions.forEach((transaction) => {
    const transactionYear = new Date(transaction.date).getFullYear();
    const transactionMonth = new Date(transaction.date).getMonth();
    const group = transactionsGroupedPerMonth.find((group) => group.year === transactionYear && group.month === transactionMonth)

    if (!group) {
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
  const monthlyValuesOverTheYear: MonthlyCategoryValues[] = [];
  // Contains all data for the aggregated label data over all months of the selected year.

  var labelWithValuesConstruct: LabelWithValues[] = [];
  labels.forEach((label) => labelWithValuesConstruct.push(getLabelWithEmptyValues(label.id)));

  for (let month = 1; month <= 12; month++) {
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

    monthlyCategoryData.transactions.forEach((transaction) => {
      // Aggregate prices of the transactions for each label
      const accordingLabelGroup = labelWithValues.find((label) => label.labelId === transaction.labelId);

      if (accordingLabelGroup) {
        accordingLabelGroup.sumOfTransactionValues += transaction.price * (transaction.transactionType === TransactionType.Expense ? -1 : 1);
        accordingLabelGroup.transactionsCount++;
      }
    });

    var totalBilancePerMonthOverAllLabels = 0;
    labelWithValues.forEach((label) => {
      totalBilancePerMonthOverAllLabels += label.sumOfTransactionValues;
    })

    var accordingMonthEntry = monthlyValuesOverTheYear.find((month) => month.month === monthlyCategoryData.month + 1);

    if (accordingMonthEntry) {
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

export function getMonthString(monthNumeric: number, activeLang: "en" | "de"): string {
  const monthsAlphabetic = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
  };
  return monthsAlphabetic[activeLang][monthNumeric - 1];
}

export function calculateAccountBalanceTimeData(transactions: Transaction[], priorBalance: number): AccountBalanceTimeData {
  const timeData: string[] = [];
  const accountBalanceData: number[] = [];

  let accountBalance: number = priorBalance ?? 0;

  transactions.forEach((transaction) => {
    const price = (transaction.transactionType === TransactionType.Expense ? -1 : 1) * transaction.price;
    accountBalance += price;

    const date = new Date(transaction.date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    timeData.push(`${year}/${month}/${day}`);
    accountBalanceData.push(accountBalance);
  });

  return { timeData, accountBalanceData };
}

export function getAccountBalanceTimeLineChartData(accountBalanceTimeData: AccountBalanceTimeData): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      },
      formatter: function (params: any) {
        const balance = params[0].data;
        const date = params[0].axisValue;
        return `<strong>Date:</strong> ${date}<br/><strong>Account Balance:</strong> ${balance.toFixed(2)}€`;
      }
    },
    title: {
      text: 'Account Balance over the time',
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    // grid: {
    //   bottom: '25%'  // Erhöhe den Abstand unten für die Scroll-Leiste
    // },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: accountBalanceTimeData.timeData,
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%']
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      // {
      //   start: 0,
      //   end: 100
      // }
    ],
    series: [
      {
        name: 'Account Balance',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgba(0, 255, 0, 0.6)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 0, 0.6)' },
            { offset: 1, color: 'rgba(0, 150, 0, 0.2)' }
          ])
        },
        data: accountBalanceTimeData.accountBalanceData,
      },
    ]
  };
}

export function getTransactionBilanceBarChartData(months: string[], bilancePerMonth: number[], labelName?: string): EChartsOption {
  return {
    title: {
      text: labelName ? `Transaction bilance over the year | Filter: ${labelName}` : 'Transaction bilance over the year',
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

export function calculateLabelShareData(transactions: Transaction[], labels: Label[]) {
  const labelsWithValues: LabelWithData[] = []

  transactions.forEach((transaction) => {
    if (transaction.transactionType !== TransactionType.Expense || transaction.labelId === null) return;

    const accordingLabelGroup = labelsWithValues.find((entry) => entry.labelId === transaction.labelId);

    if (accordingLabelGroup) {
      accordingLabelGroup.sumOfTransactionValues += transaction.price;
      accordingLabelGroup.transactionsCount++;
    }

    else {
      const labelData = labels.find((label) => label.id === transaction.labelId);
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

export function getTransactionLabelSharePieChartData(labelWithData: LabelWithData[]): EChartsOption {
  const pieChartData: PieChartData[] = labelWithData.map((labelData) => {
    return {
      name: labelData.labelName,
      value: labelData.sumOfTransactionValues,
      itemStyle: { color: labelData.labelColor },
    }
  });

  return {
    title: {
      text: 'Total transaction prices per label',
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'item',
      position: 'top',
      formatter: function (params: any) {
        const roundedPrice = params.value.toFixed(2);
        return `<strong> ${params.name} </strong> <br/> added expenses: ${roundedPrice}€ <br/> share: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: 'white',
      }
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '60%',
        label: {
          show: true,
          formatter: '{b}',
          color: 'white',
          backgroundColor: 'transparent',
        },
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

function cutStringAt(string: string, index: number): string {
  return string.length > index ? string.substring(0, index) + '...' : string;
}

export function getTransactionLabelShareCountPieChartData(labelWithData: LabelWithData[]): EChartsOption {
  const cutIndex = labelWithData.length <= 10 ? 15 : 20 - labelWithData.length;

  const histogramData: HistogramData = {
    lableTitles: labelWithData.map((labelData) => cutStringAt(labelData.labelName, cutIndex)),
    lableData: labelWithData.map((labelData) => ({ value: labelData.transactionsCount, itemStyle: { color: labelData.labelColor } })),
    tooltipData: labelWithData.map((labelData) => ({
      lableTitle: cutStringAt(labelData.labelName, cutIndex),
      lablePrice: labelData.sumOfTransactionValues,
      lableCount: labelData.transactionsCount
    }))
  };
  return {
    grid: {
      top: '15%',
      bottom: '15%'
    },
    title: {
      text: 'Total transactions per label',
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    xAxis: {
      type: 'category',
      axisTick: {
        show: false,

      },
      axisLabel: {
        color: '#ffffff',
        rotate: 0,
        interval: 0,
      },
      data: histogramData.lableTitles,
      animationDuration: 300,
      animationDurationUpdate: 300,
    },
    yAxis: {
      max: 'dataMax',
      splitLine: {
        show: false
      },
      axisLine: {
        show: true
      },
    },
    series: [
      {
        realtimeSort: true,
        name: 'X',
        type: 'bar', // Change type from 'bar' to 'bar' for vertical bars
        data: histogramData.lableData,
      }
    ],
    tooltip: {
      trigger: 'item',
      position: 'top',
      formatter: (params: any) => {
        const label = histogramData.tooltipData[params.dataIndex];

        return `
          <strong>${label.lableTitle}</strong><br/>
          Count: ${label.lableCount}<br/>
        `;
      }
    },
    animationDuration: 0,
    animationDurationUpdate: 3000,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear',
  };
}

export function getTransactionsTopExpenseOrIncome(transactions: Transaction[], labels: Label[], filter: TransactionType): BarChartData {
  // sortiere transactions so dass die transaction mit transaction.price mit dem höchsten wert vorne im array sortedTransactions ist
  const sortedTransactions = transactions.sort((a, b) => b.price - a.price);

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    if (filter === TransactionType.Expense) return transaction.transactionType === TransactionType.Expense;
    else return transaction.transactionType === TransactionType.Income;
  });

  const transactionTitles = filteredTransactions.map((transaction) => {
    const title = transaction.title ?? '';

    return cutStringAt(title, 20);
  });

  const transactionData = filteredTransactions.map((transaction) => {
    const labelColor = labels.find((label) => label.id === transaction.labelId)?.color;

    return { value: transaction.price, itemStyle: { color: labelColor ?? 'grey' } }
  });

  const tooltipData = filteredTransactions.map((transaction) => {
    const transactionTitle = transaction.title ?? 'error';
    const transactionFormattedDate = new Date(transaction.date).toLocaleDateString('de-DE');
    const transactionPrice = transaction.price;
    const labelName = labels.find((label) => label.id === transaction.labelId)?.name ?? 'error';

    return { transactionTitle: transactionTitle, transactionFormattedDate: transactionFormattedDate, transactionPrice: transactionPrice, labelName: labelName }
  })

  return { transactionTitles: transactionTitles, transactionData: transactionData, tooltipData: tooltipData }
}

export function getTopPricesChatOptions(data: BarChartData, type: TransactionType): EChartsOption {
  const maxValues = data.transactionData.length < 10 ? data.transactionData.length : 10;

  return {
    grid: {
      left: '15%',
      right: '15%'
    },
    title: {
      text: type === TransactionType.Expense ? `Top ${maxValues} Expenses` : `Top ${maxValues} Incomes`,
      left: 'center',
      top: '10px',
      textStyle: {
        color: '#ffffff'
      }
    },
    xAxis: {
      max: 'dataMax',
      splitLine: {
        show: false
      },
      axisLine: {
        show: true
      },
    },
    yAxis: {
      type: 'category',
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#ffffff'
      },
      data: data.transactionTitles,
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      max: maxValues
    },
    series: [
      {
        realtimeSort: true,
        name: 'X',
        type: 'bar',
        data: data.transactionData,
        label: {
          show: true,
          position: 'right',
          valueAnimation: true,
          formatter: '{c} €',
          color: 'white',
          backgroundColor: 'transparent',
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      position: 'top',
      formatter: (params: any) => {
        const transaction = data.tooltipData[params.dataIndex];

        return `
          <strong>${transaction.transactionTitle}</strong><br/>
          Date: ${transaction.transactionFormattedDate}<br/>
          Price: ${transaction.transactionPrice} €<br/>
          Label: ${transaction.labelName}
        `;
      }
    },
    animationDuration: 0,
    animationDurationUpdate: 3000,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear',
  };
}

export function convertToCSV(transactions: Transaction[], labels: Label[]): string {
  const headers = 'id;title;transactionType;date;price;labelName;labelColor;\n'
  const rows = transactions.map((transaction) => {
    const label = labels.find((label) => label.id === transaction.labelId);
    const price = transaction.price.toString().replace('.', ',');

    return `${transaction.id};${transaction.title};${transaction.transactionType};${transaction.date};${price};${label ? label.name : ''};${label ? label.color : ''}`;
  }).join('\n');

  return headers + rows;
}

export function calculateExpensesLabelStackTimeData(transactions: Transaction[], labels: Label[], oldestTransactionDate?: Date | null): LabelStackGraphData {
  const labelsWithYearlyData: LabelWithYearlyData[] = [];
  const oldestYear = oldestTransactionDate ? new Date(oldestTransactionDate).getFullYear() : new Date().getFullYear();
  const oldestMonth = oldestTransactionDate ? new Date(oldestTransactionDate).getMonth() : new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  const yearsAndMonths: YearsAndMonth[] = [];

  for (let year = oldestYear; year <= thisYear; year++) {
    const firstMonth = year === oldestYear ? oldestMonth : 0;
    const lastMonth = year === thisYear ? thisMonth : 11;

    for (let month = firstMonth; month <= lastMonth; month++) {
      yearsAndMonths.push({ year, month });
    }
  }

  labels.forEach((label) => {
    const sumOfExpensePerYearAndMonth: SumOfExpensePerYearAndMonth[] = yearsAndMonths.map((entry) =>
      ({ year: entry.year, month: entry.month, sumOfExpenses: 0 })
    );

    const expensesWithThisLabel = transactions.filter((transaction) => (transaction.labelId === label.id && transaction.transactionType === TransactionType.Expense));

    expensesWithThisLabel.forEach((expense) => {
      const index = sumOfExpensePerYearAndMonth.findIndex((entry) => {
        const expenseYear = new Date(expense.date).getFullYear();
        const expenseMonth = new Date(expense.date).getMonth();

        return entry.year === expenseYear && entry.month === expenseMonth;
      });

      if (index >= 0) sumOfExpensePerYearAndMonth[index].sumOfExpenses += expense.price;
    });


    labelsWithYearlyData.push({
      sumOfExpensesPerYear: sumOfExpensePerYearAndMonth.map((entry) => Math.round(entry.sumOfExpenses * 100) / 100),
      color: label.color,
      name: label.name,
    });
  });

  const labelColors: string[] = labelsWithYearlyData.map((label) => label.color);
  const timeUnits: string[] = yearsAndMonths.map((entry) => {
    return `${entry.year}/${entry.month + 1}`;
  })

  return { labelsWithYearlyData, timeUnits: timeUnits, labelColors: labelColors };
}

export function getExpensesLabelStackTimeData(data: LabelStackGraphData): EChartsOption {
  const seriesData = data.labelsWithYearlyData.map((label) => ({
    name: label.name,
    type: 'line',
    stack: 'Total',
    smooth: true,
    lineStyle: {
      width: 0
    },
    showSymbol: false,
    areaStyle: {
      opacity: 0.8,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: label.color,
        },
      ])
    },
    emphasis: {
      focus: 'series'
    },
    data: label.sumOfExpensesPerYear,
  }));



  return {
    color: data.labelColors,
    title: {
      text: 'Yearly label shares'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.timeUnits,
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: seriesData as EChartsOption['series'],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100
      }
    ]
  };
}

export function calculateYearlyColumnChartData(transactions: Transaction[], oldestTransactionDate?: Date | null) {
  const oldestYear = oldestTransactionDate ? new Date(oldestTransactionDate).getFullYear() : new Date().getFullYear();
  const thisYear = new Date().getFullYear();
  const yearlyExpenses: number[] = [];
  const yearlyIncomes: number[] = [];
  const years: number[] = [];

  for (let year = oldestYear; year <= thisYear; year++) {
    years.push(year);
  }

  years.forEach((year) => {
    const transactionsOfYear = transactions.filter((transaction) => new Date(transaction.date).getFullYear() === year);
    const expensesOfYear = transactionsOfYear.filter((transaction) => transaction.transactionType === TransactionType.Expense);
    const incomesOfYear = transactionsOfYear.filter((transaction) => transaction.transactionType === TransactionType.Income);
    const totalExpenses = expensesOfYear.reduce((sum, transaction) => sum + transaction.price, 0);
    const totalIncomes = incomesOfYear.reduce((sum, transaction) => sum + transaction.price, 0);

    yearlyExpenses.push(Math.round(totalExpenses * 100) / 100);
    yearlyIncomes.push(Math.round(totalIncomes* 100) / 100);
  });

  return { years, yearlyExpenses, yearlyIncomes };
}

export function getYearlyColumnChartData(data: {
  years: number[];
  yearlyExpenses: number[];
  yearlyIncomes: number[];
}): EChartsOption {
  return {
    title: {
      text: 'Yearly incomes and expenes'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',      
      top: 'top',    
    },
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        data: data.years,
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Income',
        type: 'bar',
        barGap: 0,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: 'rgb(8, 82, 151)',
        },
        data: data.yearlyIncomes,
      },
      {
        name: 'Expenses',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: 'rgb(143, 1, 1)' 
        },
        data: data.yearlyExpenses,
      }
    ]
  }
}
