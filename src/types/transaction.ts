export const EXPENSE_CATEGORIES = [
  'food', 'transport', 'housing', 'utilities',
  'entertainment', 'healthcare', 'shopping', 'other',
] as const;

export const INCOME_CATEGORIES = [
  'salary', 'bonus', 'investment', 'gift', 'other',
] as const;

export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category?: Category;
  date?: string;
  note?: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: Category;
  from?: string;
  to?: string;
}

export interface SummaryResponse {
  from: string;
  to: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  byCategory: Array<{
    type: TransactionType;
    category: Category;
    total: number;
  }>;
}