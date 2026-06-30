import { z, ZodError } from 'zod';
import * as transactionRepository from '@/repositories/transactionRepository';
import { summaryQuerySchema } from '@/schemas/transactionSchema';
import { ValidationError } from '@/lib/errors';
import { SummaryResponse, Category } from '@/types/transaction';

function centsToDollars(cents: number): number {
  return cents / 100;
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

export async function getSummary(from: string, to: string): Promise<SummaryResponse> {
  const validated = parseOrThrow(summaryQuerySchema, { from, to });

  const data = await transactionRepository.getSummary(validated.from, validated.to);

  const totalIncomeCents = data.totals.find(t => t.type === 'income')?.totalCents ?? 0;
  const totalExpenseCents = data.totals.find(t => t.type === 'expense')?.totalCents ?? 0;

  return {
    from: validated.from,
    to: validated.to,
    totalIncome: centsToDollars(totalIncomeCents),
    totalExpense: centsToDollars(totalExpenseCents),
    netBalance: centsToDollars(totalIncomeCents - totalExpenseCents),
    byCategory: data.byCategory.map(item => ({
      type: item.type,
      category: item.category as Category,
      total: centsToDollars(item.totalCents),
    })),
  };
}
