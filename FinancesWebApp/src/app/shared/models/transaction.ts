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

export interface GroupedTransaction {
    date: Date;
    transactions: Transaction[];
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

export interface keyMetricData {
    total: number;
    bilanz: number;
    income: number;
    expense: number;
}

export interface AddOrEditTransaction {
    useCase: 'add' | 'edit';
    transactionId: number | null; // Is null if useCase = 'add'
    transactionType: TransactionType;
}