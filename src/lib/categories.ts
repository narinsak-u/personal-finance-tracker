// Category definitions, metadata (labels + chart colors),
// and helpers for filtering by transaction type
import type { ChartConfig } from "@/components/ui/chart";
import type { TransactionType } from "@/types/transaction";

export const EXPENSE_CATEGORIES = [
  "food",
  "utilities",
  "entertainment",
  "shopping",
  "other",
] as const;

export const INCOME_CATEGORIES = [
  "salary",
  "investment",
  "gift",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type Category = ExpenseCategory | IncomeCategory;

export type CategoryMeta = {
  label: string;
  color: string;
};

export const EXPENSE_CATEGORIES_META: Record<ExpenseCategory, CategoryMeta> = {
  food: { label: "Food", color: "#ef4444" },
  utilities: { label: "Utilities", color: "#06b6d4" },
  entertainment: { label: "Entertainment", color: "#ec4899" },
  shopping: { label: "Shopping", color: "#f59e0b" },
  other: { label: "Other", color: "#94a3b8" },
};

export const INCOME_CATEGORIES_META: Record<IncomeCategory, CategoryMeta> = {
  salary: { label: "Salary", color: "#22c55e" },
  investment: { label: "Investment", color: "#8b5cf6" },
  gift: { label: "Gift", color: "#f59e0b" },
  other: { label: "Other", color: "#94a3b8" },
};

export function categoriesForType(type: TransactionType): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function categoryMeta(
  type: TransactionType,
  category: string,
): CategoryMeta | undefined {
  const meta = type === "income" ? INCOME_CATEGORIES_META : EXPENSE_CATEGORIES_META;
  return meta[category as keyof typeof meta];
}

export const expenseChartConfig = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c, EXPENSE_CATEGORIES_META[c]]),
) satisfies ChartConfig;

export const incomeChartConfig = Object.fromEntries(
  INCOME_CATEGORIES.map((c) => [c, INCOME_CATEGORIES_META[c]]),
) satisfies ChartConfig;

export function chartConfigForType(type: TransactionType): ChartConfig {
  return type === "income" ? incomeChartConfig : expenseChartConfig;
}
