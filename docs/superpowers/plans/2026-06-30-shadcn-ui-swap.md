# shadcn/ui Component Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace plain HTML/Tailwind primitives in 5 frontend components with shadcn/ui equivalents — same behavior, same layout.

**Architecture:** Run `shadcn init` to set up project config, deps, and utility files. Run `shadcn add` to copy 6 component source files into `src/components/ui/`. Then swap primitives in TransactionForm, TransactionList, SummaryCards, and CategoryBreakdown. Dashboard unchanged (composition only).

**Tech Stack:** shadcn/ui CLI with Tailwind CSS v3 (`npx shadcn-ui@latest`), Radix UI primitives, class-variance-authority, clsx, tailwind-merge.

---

## Task 1: Initialize shadcn and add component files

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/card.tsx`, `input.tsx`, `button.tsx`, `select.tsx`, `radio-group.tsx`, `label.tsx`
- Modify: `package.json`, `src/app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Initialize shadcn**

Run:
```bash
npx shadcn-ui@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Directory: `src/components/ui`
- Utility path: `src/lib/utils`

Expected: Creates `components.json`, updates `globals.css` with CSS variables, updates `tailwind.config.ts` with shadcn config, creates `src/lib/utils.ts` with `cn()` helper. Installs `tailwind-merge`, `clsx`, `class-variance-authority`, `lucide-react`, and Radix UI primitives.

- [ ] **Step 2: Add shadcn component files**

Run:
```bash
npx shadcn-ui@latest add card input button select radio-group label
```
Expected: Copies 6 component source files into `src/components/ui/`.

- [ ] **Step 3: Verify init and add succeeded**

Run:
```bash
ls src/components/ui/
```
Expected: See `card.tsx`, `input.tsx`, `button.tsx`, `select.tsx`, `radio-group.tsx`, `label.tsx`.

- [ ] **Step 4: Run tsc to verify no type errors from new files**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors (or only pre-existing unrelated errors).

- [ ] **Step 5: Commit**

Run:
```bash
git add components.json src/lib/utils.ts src/components/ui/ src/app/globals.css tailwind.config.ts package.json package-lock.json
git commit -m "feat: initialize shadcn/ui with card, input, button, select, radio-group, label"
```
Expected: shadcn setup committed.

---

## Task 2: Swap TransactionForm primitives with shadcn

**Files:**
- Modify: `src/components/TransactionForm.tsx` (full replace)

- [ ] **Step 1: Replace TransactionForm.tsx**

Replace the entire file content of `src/components/TransactionForm.tsx` with:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiPut } from '@/lib/api-client';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  function handleTypeChange(value: string) {
    if (value === 'income' || value === 'expense') {
      setType(value);
      setCategory('');
    }
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <RadioGroup value={type} onValueChange={handleTypeChange} className="flex gap-4 mt-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="type-expense" />
                <Label htmlFor="type-expense">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="type-income" />
                <Label htmlFor="type-income">Income</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount}
              onChange={e => setAmount(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} maxLength={500} className="mt-1" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              {editingTransaction ? 'Update' : 'Add'}
            </Button>
            {editingTransaction && (
              <Button type="button" variant="outline" onClick={onDone}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify type check and tests**

Run:
```bash
npx tsc --noEmit && npm run test:run
```
Expected: No type errors, 94 tests pass.

- [ ] **Step 3: Commit**

Run:
```bash
git add src/components/TransactionForm.tsx
git commit -m "refactor: swap TransactionForm HTML primitives with shadcn ui"
```
Expected: TransactionForm committed.

---

## Task 3: Swap TransactionList primitives with shadcn

**Files:**
- Modify: `src/components/TransactionList.tsx` (full replace)

- [ ] **Step 1: Replace TransactionList.tsx**

Replace the entire file content of `src/components/TransactionList.tsx` with:

```tsx
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
          <Select value={filterType || 'all'} onValueChange={v => setFilterType(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory || 'all'} onValueChange={v => setFilterCategory(v === 'all' ? '' : v)}>
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
```

- [ ] **Step 2: Verify type check and tests**

Run:
```bash
npx tsc --noEmit && npm run test:run
```
Expected: No type errors, 94 tests pass.

- [ ] **Step 3: Commit**

Run:
```bash
git add src/components/TransactionList.tsx
git commit -m "refactor: swap TransactionList HTML primitives with shadcn ui"
```
Expected: TransactionList committed.

---

## Task 4: Swap SummaryCards and CategoryBreakdown cards with shadcn Card

**Files:**
- Modify: `src/components/SummaryCards.tsx` (full replace)
- Modify: `src/components/CategoryBreakdown.tsx` (full replace)

- [ ] **Step 1: Replace SummaryCards.tsx**

Replace the entire file content of `src/components/SummaryCards.tsx` with:

```tsx
import { formatCurrency } from '@/lib/format';
import { SummaryResponse } from '@/types/transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SummaryCards({ summary }: { summary: SummaryResponse }) {
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netBalance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Replace CategoryBreakdown.tsx**

Replace the entire file content of `src/components/CategoryBreakdown.tsx` with:

```tsx
import { formatCurrency } from '@/lib/format';
import { SummaryResponse } from '@/types/transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CategoryBreakdown({
  byCategory,
}: {
  byCategory: SummaryResponse['byCategory'];
}) {
  const income = byCategory.filter(c => c.type === 'income');
  const expense = byCategory.filter(c => c.type === 'expense');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Income by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-muted-foreground text-sm">No income in this period</p>
          ) : (
            <ul className="space-y-2">
              {income.map(c => (
                <li key={`${c.type}-${c.category}`} className="flex justify-between">
                  <span className="capitalize">{c.category}</span>
                  <span className="font-medium text-green-600">{formatCurrency(c.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {expense.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expenses in this period</p>
          ) : (
            <ul className="space-y-2">
              {expense.map(c => (
                <li key={`${c.type}-${c.category}`} className="flex justify-between">
                  <span className="capitalize">{c.category}</span>
                  <span className="font-medium text-red-600">{formatCurrency(c.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify type check and tests**

Run:
```bash
npx tsc --noEmit && npm run test:run
```
Expected: No type errors, 94 tests pass.

- [ ] **Step 4: Commit**

Run:
```bash
git add src/components/SummaryCards.tsx src/components/CategoryBreakdown.tsx
git commit -m "refactor: swap SummaryCards and CategoryBreakdown wrappers with shadcn Card"
```
Expected: Both files committed.

---

## Task 5: Final verification

- [ ] **Step 1: Run full verification**

Run:
```bash
npm run test:run && npx tsc --noEmit && npm run build
```
Expected: 94 tests pass, no type errors, build succeeds.

- [ ] **Step 2: Verify all files under 200 lines**

Run:
```bash
wc -l src/components/*.tsx src/components/ui/*.tsx
```
Expected: All files under 200 lines.
