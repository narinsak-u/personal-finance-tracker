import { z } from 'zod';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

const dateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
  .refine((val) => {
    const [year, month, day] = val.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
  }, 'Invalid calendar date');

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive().max(999_999_999),
  category: z.string(),
  date: dateString,
  note: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  const validCategories: string[] = data.type === 'income'
    ? [...INCOME_CATEGORIES]
    : [...EXPENSE_CATEGORIES];
  if (!validCategories.includes(data.category)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['category'],
      message: `Category "${data.category}" is not valid for type "${data.type}"`,
    });
  }
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().max(999_999_999).optional(),
  category: z.string().optional(),
  date: dateString.optional(),
  note: z.string().max(500).nullable().optional(),
});

export const queryFiltersSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  from: dateString.optional(),
  to: dateString.optional(),
});

export const summaryQuerySchema = z.object({
  from: dateString,
  to: dateString,
});
