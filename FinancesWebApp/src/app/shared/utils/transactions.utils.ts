import { Label } from "../models/label";
import { GroupedTransaction, Transaction, TransactionType, TransactionWithLabel, keyMetricData } from "../models/transaction";

export function getListOfAvailableYears(oldestDate: Date | null): number[] {
  const currentYear = new Date().getFullYear();

  if (!oldestDate) return [currentYear];

  oldestDate = new Date(oldestDate);
  const oldestYear = oldestDate.getFullYear();
  const allYears: number[] = [];

  for (let year = currentYear; year >= oldestYear; year--) allYears.push(year);

  return allYears;
}

export function getListOfAvailableMonthsPerYear(selectedYear: number, oldestDate: Date | null): number[] {
  if (!oldestDate) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const oldestYear = new Date(oldestDate).getFullYear();
  const oldestMonth = new Date(oldestDate).getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const startMonth = selectedYear === oldestYear ? oldestMonth : 1;
  const endMonth = selectedYear === currentYear ? currentMonth : 12;
  const allMonths: number[] = [];

  for (let month = startMonth; month <= endMonth; month++) allMonths.push(month);

  return allMonths;
}

export function calculateMonthlyKeyMetricData(transactions: Transaction[], priorBalance: number | null): keyMetricData {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.transactionType === TransactionType.Income) income += transaction.price;
    else if (transaction.transactionType == TransactionType.Expense) expense -= transaction.price;
  })

  const bilanz = income + expense;
  const total = bilanz + (priorBalance ?? 0);

  return { total, bilanz, income, expense };
}

export function calculateFirstAndLastDayOfMonth(year: number, month: number) {
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const startDateString = `${year}-${month}-01`;
  const endDateString = `${year}-${month}-${daysPerMonth[month - 1]}`;
  const firstDayOfMonth = new Date(startDateString);
  const lastDayOfMonth = new Date(endDateString);

  firstDayOfMonth.setHours(2);
  firstDayOfMonth.setMinutes(0);
  lastDayOfMonth.setHours(23);
  lastDayOfMonth.setMinutes(59);

  return { firstDayOfMonth, lastDayOfMonth };
}

export function compareDates(date1: Date, date2: Date): boolean {
  const dateA = new Date(date1);
  const dateB = new Date(date2);

  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

export function mapTrasactionsWithLabelsToDateGroups(transactions: Transaction[], labels: Label[]): GroupedTransaction[] {
  const groupedTransactions: GroupedTransaction[] = []

  transactions.forEach((transaction) => {
    const correspondingLabel = labels.find((label)=> label.id === transaction.labelId);
    const transactionWithLabel: TransactionWithLabel = {
      id: transaction.id,
      transactionType: transaction.transactionType,
      date: transaction.date,
      title: transaction.title,
      labelId: transaction.labelId,
      price: transaction.price,
      rowVersion: transaction.rowVersion,
      labelName: correspondingLabel?.name ?? '',
      labelColor: correspondingLabel?.color ?? 'grey',
    }

    const existingGroup = groupedTransactions.find((group) => compareDates(group.date, transaction.date))

    if (existingGroup) existingGroup.transactions.push(transactionWithLabel);
    else {
      groupedTransactions.push({
        date: transaction.date,
        transactions: [transactionWithLabel],
      });
    }
  });

  return groupedTransactions;
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