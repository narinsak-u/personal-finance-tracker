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
  const methods = ['from', 'where', 'orderBy', 'groupBy', 'values', 'returning', 'set', 'limit', 'offset'];
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
  amount: 2550,
  category: 'food',
  date: '2026-06-30',
  note: 'lunch',
  createdAt: new Date('2026-06-30T12:00:00.000Z'),
  updatedAt: new Date('2026-06-30T12:00:00.000Z'),
};

const expectedTransaction = {
  id: 'uuid-1',
  type: 'expense',
  amount: 2550,
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
  it('returns amount directly', () => {
    expect(rowToTransaction(mockRow).amount).toBe(2550);
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

  it('returns amount as-is', () => {
    expect(rowToTransaction({ ...mockRow, amount: 1 }).amount).toBe(1);
  });

  it('returns large amount as-is', () => {
    expect(rowToTransaction({ ...mockRow, amount: 10000 }).amount).toBe(10000);
  });
});

describe('insert', () => {
  it('returns mapped transaction', async () => {
    vi.mocked(db.insert).mockReturnValue(createChainableMock([mockRow]) as any);
    const result = await insert({
      type: 'expense', amount: 2550, category: 'food', date: '2026-06-30', note: 'lunch',
    });
    expect(result).toEqual(expectedTransaction);
  });

  it('calls db.insert', async () => {
    vi.mocked(db.insert).mockReturnValue(createChainableMock([mockRow]) as any);
    await insert({
      type: 'expense', amount: 2550, category: 'food', date: '2026-06-30', note: null,
    });
    expect(db.insert).toHaveBeenCalled();
  });
});

describe('findAll', () => {
  it('returns paginated result with no filters', async () => {
    const countChain = createChainableMock([{ value: 1 }]);
    const dataChain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValueOnce(countChain as any).mockReturnValueOnce(dataChain as any);
    const result = await findAll({});
    expect(result.data).toEqual([expectedTransaction]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('calls orderBy for sorting', async () => {
    const countChain = createChainableMock([{ value: 1 }]);
    const dataChain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValueOnce(countChain as any).mockReturnValueOnce(dataChain as any);
    await findAll({});
    expect(dataChain.orderBy).toHaveBeenCalled();
  });

  it('calls where when type filter is provided', async () => {
    const countChain = createChainableMock([{ value: 1 }]);
    const dataChain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValueOnce(countChain as any).mockReturnValueOnce(dataChain as any);
    await findAll({ type: 'expense' });
    expect(dataChain.where).toHaveBeenCalled();
  });

  it('calls where when all filters are provided', async () => {
    const countChain = createChainableMock([{ value: 1 }]);
    const dataChain = createChainableMock([mockRow]);
    vi.mocked(db.select).mockReturnValueOnce(countChain as any).mockReturnValueOnce(dataChain as any);
    await findAll({ type: 'expense', category: 'food', from: '2026-01-01', to: '2026-12-31' });
    expect(dataChain.where).toHaveBeenCalled();
  });

  it('computes correct totalPages', async () => {
    const countChain = createChainableMock([{ value: 25 }]);
    const dataChain = createChainableMock(new Array(10).fill(mockRow));
    vi.mocked(db.select).mockReturnValueOnce(countChain as any).mockReturnValueOnce(dataChain as any);
    const result = await findAll({ page: 1, pageSize: 10 });
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
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
    const result = await updateById('uuid-1', { amount: 5000 });
    expect(result).toEqual(expectedTransaction);
  });

  it('returns null when not found', async () => {
    vi.mocked(db.update).mockReturnValue(createChainableMock([]) as any);
    const result = await updateById('nonexistent', { amount: 5000 });
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
    const totalsData = [{ type: 'income', total: 500000 }, { type: 'expense', total: 125075 }];
    const breakdownData = [
      { type: 'income' as const, category: 'salary', total: 500000 },
      { type: 'expense' as const, category: 'food', total: 40025 },
      { type: 'expense' as const, category: 'transport', total: 85050 },
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
