'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

interface Props {
  initialTransactions: Transaction[];
}

export default function Dashboard({ initialTransactions }: Props) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <TransactionForm
        editingTransaction={editingTransaction}
        onDone={() => setEditingTransaction(null)}
      />
      <TransactionList
        initialTransactions={initialTransactions}
        onEdit={setEditingTransaction}
      />
    </>
  );
}
