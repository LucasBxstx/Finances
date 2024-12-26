import { Color } from "echarts";
import { Label } from "./label";
import { Transaction } from "./transaction";

export interface AccountBalanceTimeData {
    timeData: string[];
    accountBalanceData: number[];
}

export interface AllMonthCategoryData {
    labels: Label [];
    monthlyValues: MonthlyCategoryValues[];
}

export interface MonthlyCategoryValues {
    month: number;
    labelsWithValues: LabelWithValues[];
    totalBilance: number;
}

export interface LabelWithValues {
    labelId: number | null;
    sumOfTransactionValues: number;
    transactionsCount: number
}

export interface LabelWithData {
    labelId: number | null;
    labelName: string;
    labelColor: string;
    sumOfTransactionValues: number;
    transactionsCount: number
}

export interface MonthTransactionGroup {
    year: number;
    month: number;
    transactions: Transaction[];
}

export interface PieChartData {
    value: number;
    name: string;
    itemStyle: {
        color: string;
    }
}

export interface HistogramData {
    lableTitles: string[];
    lableData: { value: number, itemStyle: { color: string } }[];
    tooltipData: { lableTitle: string; lablePrice: number; lableCount: number }[];
}

export interface BarChartData {
    transactionTitles: string[];
    transactionData: { value: number, itemStyle: { color: string } }[];
    tooltipData: { transactionTitle: string; transactionFormattedDate: string; transactionPrice: number; labelName: string}[];
}

export enum ErrorMessages {
    loading_failed = 0,
     add_transactions = 1,
     add_labels = 2,
}