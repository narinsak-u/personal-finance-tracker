import type {
  ExpenseCategory,
  IncomeCategory,
  Category,
} from "@/lib/categories";

export type TransactionType = "income" | "expense";
export type { ExpenseCategory, IncomeCategory, Category };

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/categories";
export { EXPENSE_CATEGORIES, INCOME_CATEGORIES };

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
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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