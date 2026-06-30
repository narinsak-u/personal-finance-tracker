import { createTransactionSchema, updateTransactionSchema, queryFiltersSchema, summaryQuerySchema } from '@/schemas/transactionSchema';

describe('createTransactionSchema', () => {
  const validExpense = {
    type: 'expense', amount: 25.50, category: 'food', date: '2026-06-30', note: 'lunch',
  };
  const validIncome = {
    type: 'income', amount: 5000, category: 'salary', date: '2026-06-30',
  };

  it('accepts valid expense with all expense categories', () => {
    const categories = ['food', 'transport', 'housing', 'utilities', 'entertainment', 'healthcare', 'shopping', 'other'];
    for (const category of categories) {
      expect(createTransactionSchema.safeParse({ ...validExpense, category }).success).toBe(true);
    }
  });

  it('accepts valid income with all income categories', () => {
    const categories = ['salary', 'bonus', 'investment', 'gift', 'other'];
    for (const category of categories) {
      expect(createTransactionSchema.safeParse({ ...validIncome, category }).success).toBe(true);
    }
  });

  it('accepts optional note omitted', () => {
    expect(createTransactionSchema.safeParse(validIncome).success).toBe(true);
  });

  it('accepts empty string note', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, note: '' }).success).toBe(true);
  });

  it('rejects missing type', () => {
    const { type, ...rest } = validExpense;
    expect(createTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing amount', () => {
    const { amount, ...rest } = validExpense;
    expect(createTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing category', () => {
    const { category, ...rest } = validExpense;
    expect(createTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing date', () => {
    const { date, ...rest } = validExpense;
    expect(createTransactionSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, type: 'invalid' }).success).toBe(false);
  });

  it('rejects expense category on income (cross-field)', () => {
    const result = createTransactionSchema.safeParse({ ...validIncome, category: 'food' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('category'))).toBe(true);
    }
  });

  it('rejects income category on expense (cross-field)', () => {
    const result = createTransactionSchema.safeParse({ ...validExpense, category: 'salary' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('category'))).toBe(true);
    }
  });

  it('rejects amount <= 0', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, amount: 0 }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...validExpense, amount: -10 }).success).toBe(false);
  });

  it('rejects amount >= 1,000,000,000', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, amount: 1_000_000_000 }).success).toBe(false);
  });

  it('rejects non-numeric amount', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, amount: 'abc' }).success).toBe(false);
  });

  it('rejects malformed date format', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, date: '30-06-2026' }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...validExpense, date: '2026/06/30' }).success).toBe(false);
  });

  it('rejects invalid calendar date (Feb 30)', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, date: '2026-02-30' }).success).toBe(false);
  });

  it('rejects note exceeding 500 chars', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, note: 'a'.repeat(501) }).success).toBe(false);
  });

  it('accepts note of exactly 500 chars', () => {
    expect(createTransactionSchema.safeParse({ ...validExpense, note: 'a'.repeat(500) }).success).toBe(true);
  });
});

describe('updateTransactionSchema', () => {
  it('accepts subset of fields (only amount)', () => {
    expect(updateTransactionSchema.safeParse({ amount: 50 }).success).toBe(true);
  });

  it('accepts subset of fields (only note)', () => {
    expect(updateTransactionSchema.safeParse({ note: 'updated' }).success).toBe(true);
  });

  it('accepts null note to clear it', () => {
    expect(updateTransactionSchema.safeParse({ note: null }).success).toBe(true);
  });

  it('accepts empty object', () => {
    expect(updateTransactionSchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid type even in partial update', () => {
    expect(updateTransactionSchema.safeParse({ type: 'invalid' }).success).toBe(false);
  });

  it('rejects amount <= 0 in partial update', () => {
    expect(updateTransactionSchema.safeParse({ amount: -5 }).success).toBe(false);
  });

  it('rejects malformed date in partial update', () => {
    expect(updateTransactionSchema.safeParse({ date: 'invalid' }).success).toBe(false);
  });

  it('rejects note exceeding 500 chars in partial update', () => {
    expect(updateTransactionSchema.safeParse({ note: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('queryFiltersSchema', () => {
  it('accepts empty object (no filters)', () => {
    expect(queryFiltersSchema.safeParse({}).success).toBe(true);
  });

  it('accepts all valid filters', () => {
    expect(queryFiltersSchema.safeParse({ type: 'expense', category: 'food', from: '2026-01-01', to: '2026-12-31' }).success).toBe(true);
  });

  it('accepts partial filters', () => {
    expect(queryFiltersSchema.safeParse({ type: 'income' }).success).toBe(true);
  });

  it('rejects invalid type', () => {
    expect(queryFiltersSchema.safeParse({ type: 'invalid' }).success).toBe(false);
  });

  it('rejects malformed from date', () => {
    expect(queryFiltersSchema.safeParse({ from: 'invalid' }).success).toBe(false);
  });

  it('rejects malformed to date', () => {
    expect(queryFiltersSchema.safeParse({ to: '01-01-2026' }).success).toBe(false);
  });
});

describe('summaryQuerySchema', () => {
  it('accepts valid from and to dates', () => {
    expect(summaryQuerySchema.safeParse({ from: '2026-01-01', to: '2026-12-31' }).success).toBe(true);
  });

  it('rejects missing from', () => {
    expect(summaryQuerySchema.safeParse({ to: '2026-12-31' }).success).toBe(false);
  });

  it('rejects missing to', () => {
    expect(summaryQuerySchema.safeParse({ from: '2026-01-01' }).success).toBe(false);
  });

  it('rejects malformed from date', () => {
    expect(summaryQuerySchema.safeParse({ from: 'invalid', to: '2026-12-31' }).success).toBe(false);
  });
});
