export interface Transaction {
    id: number;
    userId: string;
    transactionType: TransactionType;
    date: Date;
    title: string | null;
    label: string | null;
    price: number;
    rowVersion: string | null;
}

export enum TransactionType {
    Income = 0,
    Expense = 1
}

export interface TransactionView {
    priorBalance: number | null;
    oldestTransactionDate: Date | null;
    transactions: Transaction[];
}
