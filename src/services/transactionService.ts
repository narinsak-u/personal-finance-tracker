import { z } from 'zod';
import * as transactionRepository from '@/repositories/transactionRepository';
import { createTransactionSchema, updateTransactionSchema, queryFiltersSchema } from '@/schemas/transactionSchema';
import { ValidationError, NotFoundError, parseOrThrow } from '@/lib/errors';
import type {
  Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionFilters, PaginatedResult,
} from '@/types/transaction';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '@/types/transaction';

// Validates and creates a new transaction, delegates to repository
export async function create(input: CreateTransactionInput): Promise<Transaction> {
  const validated = parseOrThrow(createTransactionSchema, input);
  return transactionRepository.insert({
    type: validated.type,
    amount: validated.amount,
    category: validated.category,
    date: validated.date,
    note: validated.note ?? null,
  });
}

// Validates filters and returns paginated transactions
export async function list(filters: TransactionFilters): Promise<PaginatedResult<Transaction>> {
  const validated = parseOrThrow(queryFiltersSchema, filters);
  return transactionRepository.findAll(validated as TransactionFilters);
}

// Returns a transaction by id, throws NotFoundError if missing
export async function getById(id: string): Promise<Transaction> {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) throw new NotFoundError('Transaction not found');
  return transaction;
}

// Validates and partially updates a transaction, cross-validates category against type if either changes
export async function update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
  const validated = parseOrThrow(updateTransactionSchema, input);

  if (validated.type !== undefined || validated.category !== undefined) {
    const existing = await transactionRepository.findById(id);
    if (!existing) throw new NotFoundError('Transaction not found');

    const effectiveType = validated.type ?? existing.type;
    const effectiveCategory = validated.category ?? existing.category;
    const validCategories = effectiveType === 'income'
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

    if (!(validCategories as readonly string[]).includes(effectiveCategory)) {
      throw new ValidationError([{
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: `Category "${effectiveCategory}" is not valid for type "${effectiveType}"`,
      }]);
    }
  }

  const rowData: Record<string, unknown> = {};
  if (validated.type !== undefined) rowData.type = validated.type;
  if (validated.amount !== undefined) rowData.amount = validated.amount;
  if (validated.category !== undefined) rowData.category = validated.category;
  if (validated.date !== undefined) rowData.date = validated.date;
  if (validated.note !== undefined) rowData.note = validated.note;

  const result = await transactionRepository.updateById(id, rowData);
  if (!result) throw new NotFoundError('Transaction not found');
  return result;
}

// Deletes a transaction by id, throws NotFoundError if it didn't exist
export async function remove(id: string): Promise<void> {
  const count = await transactionRepository.deleteById(id);
  if (count === 0) throw new NotFoundError('Transaction not found');
}