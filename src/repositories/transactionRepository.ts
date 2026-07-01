import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import type {
  Transaction,
  TransactionFilters,
  PaginatedResult,
} from "@/types/transaction";

type TransactionRow = typeof schema.transactions.$inferSelect;

interface InsertRow {
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note: string | null;
}

interface UpdateRow {
  type?: "income" | "expense";
  amount?: number;
  category?: string;
  date?: string;
  note?: string | null;
}

interface SummaryTotals {
  type: "income" | "expense";
  total: number;
}

interface SummaryBreakdown {
  type: "income" | "expense";
  category: string;
  total: number;
}

interface SummaryData {
  totals: SummaryTotals[];
  byCategory: SummaryBreakdown[];
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction["type"],
    amount: Number(row.amount),
    category: row.category as Transaction["category"],
    date: row.date,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toNumber(val: unknown): number {
  return Number(val ?? 0);
}

export async function insert(data: InsertRow): Promise<Transaction> {
  const [row] = await db
    .insert(schema.transactions)
    .values({
      type: data.type,
      amount: data.amount,
      category: data.category,
      date: data.date,
      note: data.note,
    })
    .returning();
  return rowToTransaction(row);
}

function buildConditions(filters: TransactionFilters): ReturnType<typeof and> {
  const conds: ReturnType<typeof eq | typeof gte | typeof lte>[] = [];
  if (filters.type) conds.push(eq(schema.transactions.type, filters.type));
  if (filters.category)
    conds.push(eq(schema.transactions.category, filters.category));
  if (filters.from) conds.push(gte(schema.transactions.date, filters.from));
  if (filters.to) conds.push(lte(schema.transactions.date, filters.to));
  return conds.length > 0
    ? and(...conds)
    : (undefined as unknown as ReturnType<typeof and>);
}

export async function findAll(
  filters: TransactionFilters,
): Promise<PaginatedResult<Transaction>> {
  const where = buildConditions(filters);
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 10));
  const offset = (page - 1) * pageSize;

  const countResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(schema.transactions)
    .where(where);
  const total = Number(countResult[0]?.value ?? 0);

  const rows = await db
    .select()
    .from(schema.transactions)
    .where(where)
    .orderBy(desc(schema.transactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows.map(rowToTransaction),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function findById(id: string): Promise<Transaction | null> {
  const [row] = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.id, id));
  return row ? rowToTransaction(row) : null;
}

export async function updateById(
  id: string,
  data: UpdateRow,
): Promise<Transaction | null> {
  const [row] = await db
    .update(schema.transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.transactions.id, id))
    .returning();
  return row ? rowToTransaction(row) : null;
}

export async function deleteById(id: string): Promise<number> {
  const rows = await db
    .delete(schema.transactions)
    .where(eq(schema.transactions.id, id))
    .returning();
  return rows.length;
}

export async function getSummary(
  from: string,
  to: string,
): Promise<SummaryData> {
  const dateFilter = and(
    gte(schema.transactions.date, from),
    lte(schema.transactions.date, to),
  );

  const totals = await db
    .select({
      type: schema.transactions.type,
      total: sql<number>`sum(${schema.transactions.amount})`,
    })
    .from(schema.transactions)
    .where(dateFilter)
    .groupBy(schema.transactions.type);

  const byCategory = await db
    .select({
      type: schema.transactions.type,
      category: schema.transactions.category,
      total: sql<number>`sum(${schema.transactions.amount})`,
    })
    .from(schema.transactions)
    .where(dateFilter)
    .groupBy(schema.transactions.type, schema.transactions.category);

  return {
    totals: totals.map((t) => ({ type: t.type, total: toNumber(t.total) })),
    byCategory: byCategory.map((c) => ({
      type: c.type,
      category: c.category,
      total: toNumber(c.total),
    })),
  };
}
