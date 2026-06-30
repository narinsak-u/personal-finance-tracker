'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiDelete } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/format';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  initialTransactions: Transaction[];
  onEdit: (t: Transaction) => void;
}

export default function TransactionList({ initialTransactions, onEdit }: Props) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  useEffect(() => {
    const hasFilters = filterType || filterCategory || filterFrom || filterTo;
    if (!hasFilters) {
      setTransactions(initialTransactions);
      return;
    }
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterCategory) params.set('category', filterCategory);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    apiGet<Transaction[]>(`/api/transactions?${params}`)
      .then(setTransactions)
      .catch(() => {});
  }, [filterType, filterCategory, filterFrom, filterTo, initialTransactions]);

  async function handleDelete(id: string) {
    try {
      await apiDelete(`/api/transactions/${id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={filterType || 'all'} onValueChange={v => setFilterType(v === 'all' ? '' : (v ?? ''))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory || 'all'} onValueChange={v => setFilterCategory(v === 'all' ? '' : (v ?? ''))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-36" />
          <Input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-36" />
        </div>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No transactions found</p>
        ) : (
          <ul className="divide-y">
            {transactions.map(t => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">{t.category}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{formatDate(t.date)}</span>
                  {t.note && <span className="ml-2 text-sm text-muted-foreground">&mdash; {t.note}</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
