import { formatCurrency, formatDate } from '@/lib/format';

describe('formatCurrency', () => {
  it('formats positive amount with THB symbol', () => {
    expect(formatCurrency(25.5)).toBe('฿26');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('฿0');
  });

  it('formats large numbers', () => {
    expect(formatCurrency(1000000)).toBe('฿1,000,000');
  });

  it('rounds to nearest integer', () => {
    expect(formatCurrency(25.555)).toBe('฿26');
  });

  it('formats small decimal amounts', () => {
    expect(formatCurrency(0.01)).toBe('฿0');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-50.25)).toBe('-฿50');
  });
});

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2026-06-30')).toBe('Jun 30, 2026');
  });

  it('formats January 1st', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('formats December 31st', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  it('handles leap year date', () => {
    expect(formatDate('2024-02-29')).toBe('Feb 29, 2024');
  });

  it('handles year boundary', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });
});