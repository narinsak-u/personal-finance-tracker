import { pgTable, uuid, pgEnum, text, integer, date, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: transactionTypeEnum('type').notNull(),
  amountCents: integer('amount_cents').notNull(),
  category: text('category').notNull(),
  date: date('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  check('amount_positive_check', sql`${table.amountCents} > 0`),
]);
