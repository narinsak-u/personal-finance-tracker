'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiDelete } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/format';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Transactions</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">All categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="border rounded px-2 py-1 text-sm" />
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm">No transactions found</p>
      ) : (
        <ul className="divide-y">
          {transactions.map(t => (
            <li key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <span className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <span className="ml-2 text-sm text-gray-500">{t.category}</span>
                <span className="ml-2 text-sm text-gray-400">{formatDate(t.date)}</span>
                {t.note && <span className="ml-2 text-sm text-gray-400">— {t.note}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(t)} className="text-blue-500 text-sm hover:underline">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
