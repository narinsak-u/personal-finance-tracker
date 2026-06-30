import { z, ZodError } from 'zod';
import * as transactionRepository from '@/repositories/transactionRepository';
import { createTransactionSchema, updateTransactionSchema, queryFiltersSchema } from '@/schemas/transactionSchema';
import { ValidationError, NotFoundError } from '@/lib/errors';
import {
  Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionFilters,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '@/types/transaction';

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new ValidationError(e.issues);
    }
    throw e;
  }
}

export async function create(input: CreateTransactionInput): Promise<Transaction> {
  const validated = parseOrThrow(createTransactionSchema, input);
  return transactionRepository.insert({
    type: validated.type,
    amountCents: dollarsToCents(validated.amount),
    category: validated.category,
    date: validated.date,
    note: validated.note ?? null,
  });
}

export async function list(filters: TransactionFilters): Promise<Transaction[]> {
  const validated = parseOrThrow(queryFiltersSchema, filters);
  return transactionRepository.findAll(validated as TransactionFilters);
}

export async function getById(id: string): Promise<Transaction> {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) throw new NotFoundError('Transaction not found');
  return transaction;
}

export async function update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
  const validated = parseOrThrow(updateTransactionSchema, input);

  if (validated.type !== undefined || validated.category !== undefined) {
    const existing = await transactionRepository.findById(id);
    if (!existing) throw new NotFoundError('Transaction not found');

    const effectiveType = validated.type ?? existing.type;
    const effectiveCategory = validated.category ?? existing.category;
    const validCategories: string[] = effectiveType === 'income'
      ? [...INCOME_CATEGORIES]
      : [...EXPENSE_CATEGORIES];

    if (!validCategories.includes(effectiveCategory)) {
      throw new ValidationError([{
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: `Category "${effectiveCategory}" is not valid for type "${effectiveType}"`,
      }]);
    }
  }

  const rowData: Record<string, unknown> = {};
  if (validated.type !== undefined) rowData.type = validated.type;
  if (validated.amount !== undefined) rowData.amountCents = dollarsToCents(validated.amount);
  if (validated.category !== undefined) rowData.category = validated.category;
  if (validated.date !== undefined) rowData.date = validated.date;
  if (validated.note !== undefined) rowData.note = validated.note;

  const result = await transactionRepository.updateById(id, rowData);
  if (!result) throw new NotFoundError('Transaction not found');
  return result;
}

export async function remove(id: string): Promise<void> {
  const count = await transactionRepository.deleteById(id);
  if (count === 0) throw new NotFoundError('Transaction not found');
}