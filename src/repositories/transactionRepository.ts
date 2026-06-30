import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import * as schema from '@/db/schema';
import { Transaction, TransactionFilters } from '@/types/transaction';

interface TransactionRow {
  id: string;
  type: 'income' | 'expense';
  amountCents: number;
  category: string;
  date: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertRow {
  type: 'income' | 'expense';
  amountCents: number;
  category: string;
  date: string;
  note: string | null;
}

interface UpdateRow {
  type?: 'income' | 'expense';
  amountCents?: number;
  category?: string;
  date?: string;
  note?: string | null;
}

interface SummaryTotals {
  type: 'income' | 'expense';
  totalCents: number;
}

interface SummaryBreakdown {
  type: 'income' | 'expense';
  category: string;
  totalCents: number;
}

interface SummaryData {
  totals: SummaryTotals[];
  byCategory: SummaryBreakdown[];
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amountCents / 100,
    category: row.category as Transaction['category'],
    date: row.date,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function insert(data: InsertRow): Promise<Transaction> {
  const [row] = await db.insert(schema.transactions).values({
    type: data.type,
    amountCents: data.amountCents,
    category: data.category,
    date: data.date,
    note: data.note,
  }).returning();
  return rowToTransaction(row as TransactionRow);
}

export async function findAll(filters: TransactionFilters): Promise<Transaction[]> {
  const conditions = [];
  if (filters.type) conditions.push(eq(schema.transactions.type, filters.type));
  if (filters.category) conditions.push(eq(schema.transactions.category, filters.category));
  if (filters.from) conditions.push(gte(schema.transactions.date, filters.from));
  if (filters.to) conditions.push(lte(schema.transactions.date, filters.to));

  const baseQuery = db.select().from(schema.transactions);
  const rows = conditions.length > 0
    ? await baseQuery.where(and(...conditions)).orderBy(desc(schema.transactions.date))
    : await baseQuery.orderBy(desc(schema.transactions.date));

  return (rows as TransactionRow[]).map(rowToTransaction);
}

export async function findById(id: string): Promise<Transaction | null> {
  const [row] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
  return row ? rowToTransaction(row as TransactionRow) : null;
}

export async function updateById(id: string, data: UpdateRow): Promise<Transaction | null> {
  const [row] = await db.update(schema.transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.transactions.id, id))
    .returning();
  return row ? rowToTransaction(row as TransactionRow) : null;
}

export async function deleteById(id: string): Promise<number> {
  const rows = await db.delete(schema.transactions)
    .where(eq(schema.transactions.id, id))
    .returning();
  return (rows as TransactionRow[]).length;
}

export async function getSummary(from: string, to: string): Promise<SummaryData> {
  const totals = await db.select({
    type: schema.transactions.type,
    totalCents: sql<number>`sum(${schema.transactions.amountCents})`,
  })
    .from(schema.transactions)
    .where(and(gte(schema.transactions.date, from), lte(schema.transactions.date, to)))
    .groupBy(schema.transactions.type);

  const byCategory = await db.select({
    type: schema.transactions.type,
    category: schema.transactions.category,
    totalCents: sql<number>`sum(${schema.transactions.amountCents})`,
  })
    .from(schema.transactions)
    .where(and(gte(schema.transactions.date, from), lte(schema.transactions.date, to)))
    .groupBy(schema.transactions.type, schema.transactions.category);

  return {
    totals: totals as SummaryTotals[],
    byCategory: byCategory as SummaryBreakdown[],
  };
}
