vi.mock('@/repositories/transactionRepository');

import * as transactionRepository from '@/repositories/transactionRepository';
import * as summaryService from '@/services/summaryService';
import { ValidationError } from '@/lib/errors';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSummary', () => {
  it('returns assembled summary with totals and breakdown', async () => {
    vi.mocked(transactionRepository.getSummary).mockResolvedValue({
      totals: [
        { type: 'income', totalCents: 500000 },
        { type: 'expense', totalCents: 125075 },
      ],
      byCategory: [
        { type: 'income', category: 'salary', totalCents: 500000 },
        { type: 'expense', category: 'food', totalCents: 40025 },
        { type: 'expense', category: 'transport', totalCents: 85050 },
      ],
    });

    const result = await summaryService.getSummary('2026-01-01', '2026-12-31');

    expect(result).toEqual({
      from: '2026-01-01',
      to: '2026-12-31',
      totalIncome: 5000.00,
      totalExpense: 1250.75,
      netBalance: 3749.25,
      byCategory: [
        { type: 'income', category: 'salary', total: 5000.00 },
        { type: 'expense', category: 'food', total: 400.25 },
        { type: 'expense', category: 'transport', total: 850.50 },
      ],
    });
  });

  it('returns zeroed totals when no transactions in period', async () => {
    vi.mocked(transactionRepository.getSummary).mockResolvedValue({
      totals: [],
      byCategory: [],
    });

    const result = await summaryService.getSummary('2026-01-01', '2026-12-31');

    expect(result).toEqual({
      from: '2026-01-01',
      to: '2026-12-31',
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      byCategory: [],
    });
  });

  it('handles only income transactions (no expenses)', async () => {
    vi.mocked(transactionRepository.getSummary).mockResolvedValue({
      totals: [{ type: 'income', totalCents: 300000 }],
      byCategory: [{ type: 'income', category: 'salary', totalCents: 300000 }],
    });

    const result = await summaryService.getSummary('2026-01-01', '2026-12-31');

    expect(result.totalIncome).toBe(3000.00);
    expect(result.totalExpense).toBe(0);
    expect(result.netBalance).toBe(3000.00);
  });

  it('handles only expense transactions (no income)', async () => {
    vi.mocked(transactionRepository.getSummary).mockResolvedValue({
      totals: [{ type: 'expense', totalCents: 150000 }],
      byCategory: [{ type: 'expense', category: 'food', totalCents: 150000 }],
    });

    const result = await summaryService.getSummary('2026-01-01', '2026-12-31');

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(1500.00);
    expect(result.netBalance).toBe(-1500.00);
  });

  it('calls repo with correct date range', async () => {
    vi.mocked(transactionRepository.getSummary).mockResolvedValue({ totals: [], byCategory: [] });
    await summaryService.getSummary('2026-06-01', '2026-06-30');
    expect(transactionRepository.getSummary).toHaveBeenCalledWith('2026-06-01', '2026-06-30');
  });

  it('throws ValidationError on malformed from date', async () => {
    await expect(
      summaryService.getSummary('invalid', '2026-12-31'),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError on missing to date', async () => {
    await expect(
      summaryService.getSummary('2026-01-01', ''),
    ).rejects.toThrow(ValidationError);
  });
});
