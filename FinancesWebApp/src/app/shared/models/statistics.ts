import { Color } from "echarts";
import { Label } from "./label";
import { Transaction } from "./transaction";

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

export interface pieChartData {
    value: number;
    name: string;
    itemStyle: {
        color: string;
    }
}