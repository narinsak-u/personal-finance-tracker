vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from '@/db/client';
import {
  insert, findAll, findById, updateById, deleteById, getSummary,
  rowToTransaction,
} from '@/repositories/transactionRepository';

function createChainableMock<T>(resolveValue: T): any {
  const chain: any = {};
  const methods = ['from', 'where', 'orderBy', 'groupBy', 'values', 'returning', 'set'];
  for (const method of methods) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve: (v: T) => any, reject?: (e: any) => any) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return chain;
}

const mockRow = {
  id: 'uuid-1',
  type: 'expense' as const,
  amountCents: 2550,
  category: 'food',
  date: '2026-06-30',
  note: 'lunch',
  createdAt: new Date('2026-06-30T12:00:00.000Z'),
  updatedAt: new Date('2026-06-30T12:00:00.000Z'),
};

const expectedTransaction = {
  id: 'uuid-1',
  type: 'expense',
  amount: 25.50,
  category: 'food',
  date: '2026-06-30',
  note: 'lunch',
  createdAt: '2026-06-30T12:00:00.000Z',
  updatedAt: '2026-06-30T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('rowToTransaction', () => {
  it('converts amountCents to amount in dollars', () => {
    expect(rowToTransaction(mockRow).amount).toBe(25.50);
  });

  it('converts createdAt Date to ISO string', () => {
    expect(rowToTransaction(mockRow).createdAt).toBe('2026-06-30T12:00:00.000Z');
  });

  it('converts updatedAt Date to ISO string', () => {
    expect(rowToTransaction(mockRow).updatedAt).toBe('2026-06-30T12:00:00.000Z');
  });

  it('preserves null note', () => {
    expect(rowToTransaction({ ...mockRow, note: null }).note).toBeNull();
  });

  it('converts 1 cent to 0.01 dollars', () => {
    expect(rowToTransaction({ ...mockRow, amountCents: 1 }).amount).toBe(0.01);
  });

  it('converts 10000 cents to 100 dollars', () => {
    expect(rowToTransaction({ ...mockRow, amountCents: 10000 }).amount).toBe(100);
  });
});

describe('insert', () => {
  it('returns mapped transaction', async () => {
    vi.mocked(db.insert).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await insert({
      type: 'expense', amountCents: 2550, category: 'food', date: '2026-06-30', note: 'lunch',
    });
    expect(result).toEqual(expectedTransaction);
  });

  it('calls db.insert', async () => {
    vi.mocked(db.insert).mockReturnValue(createChainableMock([mockRow]) as any);
    await insert({
      type: 'expense', amountCents: 2550, category: 'food', date: '2026-06-30', note: null,
    });
    expect(db.insert).toHaveBeenCalled();
  });
});

describe('findAll', () => {
  it('returns mapped transactions with no filters', async () => {
    vi.mocked(db.select).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await findAll({});
    expect(result).toEqual([expectedTransaction]);
  });

  it('calls orderBy for sorting', async () => {
    const chain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValue(chain as any);
    await findAll({});
    expect(chain.orderBy).toHaveBeenCalled();
  });

  it('calls where when type filter is provided', async () => {
    const chain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValue(chain as any);
    await findAll({ type: 'expense' });
    expect(chain.where).toHaveBeenCalled();
  });

  it('calls where when all filters are provided', async () => {
    const chain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValue(chain as any);
    await findAll({ type: 'expense', category: 'food', from: '2026-01-01', to: '2026-12-31' });
    expect(chain.where).toHaveBeenCalled();
  });
});

describe('findById', () => {
  it('returns mapped transaction when found', async () => {
    vi.mocked(db.select).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await findById('uuid-1');
    expect(result).toEqual(expectedTransaction);
  });

  it('returns null when not found', async () => {
    vi.mocked(db.select).mockReturnValue(createChainableMock([]) as any);
    const result = await findById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('updateById', () => {
  it('returns updated transaction when found', async () => {
    vi.mocked(db.update).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await updateById('uuid-1', { amountCents: 5000 });
    expect(result).toEqual(expectedTransaction);
  });

  it('returns null when not found', async () => {
    vi.mocked(db.update).mockReturnValue(createChainableMock([]) as any);
    const result = await updateById('nonexistent', { amountCents: 5000 });
    expect(result).toBeNull();
  });
});

describe('deleteById', () => {
  it('returns 1 when row is deleted', async () => {
    vi.mocked(db.delete).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await deleteById('uuid-1');
    expect(result).toBe(1);
  });

  it('returns 0 when no row is deleted', async () => {
    vi.mocked(db.delete).mockReturnValue(createChainableMock([]) as any);
    const result = await deleteById('nonexistent');
    expect(result).toBe(0);
  });
});

describe('getSummary', () => {
  it('returns totals and breakdown', async () => {
    const totalsData = [{ type: 'income', totalCents: 500000 }, { type: 'expense', totalCents: 125075 }];
    const breakdownData = [
      { type: 'income' as const, category: 'salary', totalCents: 500000 },
      { type: 'expense' as const, category: 'food', totalCents: 40025 },
      { type: 'expense' as const, category: 'transport', totalCents: 85050 },
    ];
    vi.mocked(db.select)
      .mockReturnValueOnce(createChainableMock(totalsData) as any)
      .mockReturnValueOnce(createChainableMock(breakdownData) as any);

    const result = await getSummary('2026-01-01', '2026-12-31');
    expect(result.totals).toEqual(totalsData);
    expect(result.byCategory).toEqual(breakdownData);
  });

  it('returns empty arrays when no transactions in period', async () => {
    vi.mocked(db.select)
      .mockReturnValueOnce(createChainableMock([]) as any)
      .mockReturnValueOnce(createChainableMock([]) as any);

    const result = await getSummary('2026-01-01', '2026-12-31');
    expect(result.totals).toEqual([]);
    expect(result.byCategory).toEqual([]);
  });
});
