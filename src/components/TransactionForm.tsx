'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api-client';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface Props {
  editingTransaction: Transaction | null;
  onDone: () => void;
}

export default function TransactionForm({ editingTransaction, onDone }: Props) {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError(null);
  }, [editingTransaction]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(newType: 'income' | 'expense') {
    setType(newType);
    setCategory('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      type,
      amount: parseFloat(amount),
      category,
      date,
      note: note || undefined,
    };
    try {
      if (editingTransaction) {
        await apiPut(`/api/transactions/${editingTransaction.id}`, body);
      } else {
        await apiPost('/api/transactions', body);
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" checked={type === 'expense'} onChange={() => handleTypeChange('expense')} />
            Expense
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={type === 'income'} onChange={() => handleTypeChange('income')} />
            Income
          </label>
        </div>
        <input
          type="number" step="0.01" placeholder="Amount" value={amount}
          onChange={e => setAmount(e.target.value)} required
          className="w-full border rounded px-3 py-2"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} required className="w-full border rounded px-3 py-2">
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} maxLength={500} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editingTransaction ? 'Update' : 'Add'}
        </button>
        {editingTransaction && (
          <button type="button" onClick={onDone} className="ml-2 text-gray-500 px-4 py-2">
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
