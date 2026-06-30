vi.mock('@/repositories/transactionRepository');

import * as transactionRepository from '@/repositories/transactionRepository';
import * as transactionService from '@/services/transactionService';
import { ValidationError, NotFoundError } from '@/lib/errors';
import type { Transaction } from '@/types/transaction';

const mockTransaction: Transaction = {
  id: 'uuid-1', type: 'expense', amount: 25.50, category: 'food',
  date: '2026-06-30', note: 'lunch',
  createdAt: '2026-06-30T12:00:00.000Z', updatedAt: '2026-06-30T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('create', () => {
  it('calls repo with cents-converted amount', async () => {
    vi.mocked(transactionRepository.insert).mockResolvedValue(mockTransaction);
    await transactionService.create({
      type: 'expense', amount: 25.50, category: 'food', date: '2026-06-30', note: 'lunch',
    });
    expect(transactionRepository.insert).toHaveBeenCalledWith({
      type: 'expense', amountCents: 2550, category: 'food', date: '2026-06-30', note: 'lunch',
    });
  });

  it('returns the created transaction', async () => {
    vi.mocked(transactionRepository.insert).mockResolvedValue(mockTransaction);
    const result = await transactionService.create({
      type: 'expense', amount: 25.50, category: 'food', date: '2026-06-30', note: 'lunch',
    });
    expect(result).toEqual(mockTransaction);
  });

  it('converts 0.01 dollars to 1 cent', async () => {
    vi.mocked(transactionRepository.insert).mockResolvedValue(mockTransaction);
    await transactionService.create({
      type: 'expense', amount: 0.01, category: 'food', date: '2026-06-30',
    });
    expect(transactionRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 1 }),
    );
  });

  it('converts 100 dollars to 10000 cents', async () => {
    vi.mocked(transactionRepository.insert).mockResolvedValue(mockTransaction);
    await transactionService.create({
      type: 'income', amount: 100, category: 'salary', date: '2026-06-30',
    });
    expect(transactionRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 10000 }),
    );
  });

  it('passes null note when note is not provided', async () => {
    vi.mocked(transactionRepository.insert).mockResolvedValue(mockTransaction);
    await transactionService.create({
      type: 'expense', amount: 25.50, category: 'food', date: '2026-06-30',
    });
    expect(transactionRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ note: null }),
    );
  });

  it('throws ValidationError on invalid input', async () => {
    await expect(
      transactionService.create({ type: 'invalid', amount: 25, category: 'food', date: '2026-06-30' } as any),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError on cross-field mismatch', async () => {
    await expect(
      transactionService.create({ type: 'income', amount: 100, category: 'food', date: '2026-06-30' }),
    ).rejects.toThrow(ValidationError);
  });
});

describe('list', () => {
  it('returns array from repo', async () => {
    vi.mocked(transactionRepository.findAll).mockResolvedValue([mockTransaction]);
    const result = await transactionService.list({});
    expect(result).toEqual([mockTransaction]);
  });

  it('passes filters to repo', async () => {
    vi.mocked(transactionRepository.findAll).mockResolvedValue([]);
    await transactionService.list({ type: 'expense', category: 'food' });
    expect(transactionRepository.findAll).toHaveBeenCalledWith({ type: 'expense', category: 'food' });
  });

  it('passes empty filters when none provided', async () => {
    vi.mocked(transactionRepository.findAll).mockResolvedValue([]);
    await transactionService.list({});
    expect(transactionRepository.findAll).toHaveBeenCalledWith({});
  });

  it('throws ValidationError on invalid filter type', async () => {
    await expect(
      transactionService.list({ type: 'invalid' as any }),
    ).rejects.toThrow(ValidationError);
  });
});

describe('getById', () => {
  it('returns transaction when found', async () => {
    vi.mocked(transactionRepository.findById).mockResolvedValue(mockTransaction);
    const result = await transactionService.getById('uuid-1');
    expect(result).toEqual(mockTransaction);
  });

  it('throws NotFoundError when not found', async () => {
    vi.mocked(transactionRepository.findById).mockResolvedValue(null);
    await expect(transactionService.getById('nonexistent')).rejects.toThrow(NotFoundError);
  });
});

describe('update', () => {
  it('returns updated transaction when found', async () => {
    vi.mocked(transactionRepository.findById).mockResolvedValue(mockTransaction);
    vi.mocked(transactionRepository.updateById).mockResolvedValue(mockTransaction);
    const result = await transactionService.update('uuid-1', { amount: 50 });
    expect(result).toEqual(mockTransaction);
  });

  it('converts amount to cents on update', async () => {
    vi.mocked(transactionRepository.updateById).mockResolvedValue(mockTransaction);
    await transactionService.update('uuid-1', { amount: 50.25 });
    expect(transactionRepository.updateById).toHaveBeenCalledWith('uuid-1', expect.objectContaining({ amountCents: 5025 }));
  });

  it('throws NotFoundError when not found', async () => {
    vi.mocked(transactionRepository.findById).mockResolvedValue(null);
    vi.mocked(transactionRepository.updateById).mockResolvedValue(null);
    await expect(transactionService.update('nonexistent', { amount: 50 })).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on invalid amount', async () => {
    await expect(
      transactionService.update('uuid-1', { amount: -10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('passes null note to repo', async () => {
    vi.mocked(transactionRepository.updateById).mockResolvedValue(mockTransaction);
    await transactionService.update('uuid-1', { note: null });
    expect(transactionRepository.updateById).toHaveBeenCalledWith('uuid-1', expect.objectContaining({ note: null }));
  });
});

describe('remove', () => {
  it('resolves when row is deleted', async () => {
    vi.mocked(transactionRepository.deleteById).mockResolvedValue(1);
    await expect(transactionService.remove('uuid-1')).resolves.toBeUndefined();
  });

  it('throws NotFoundError when zero rows deleted', async () => {
    vi.mocked(transactionRepository.deleteById).mockResolvedValue(0);
    await expect(transactionService.remove('nonexistent')).rejects.toThrow(NotFoundError);
  });
});