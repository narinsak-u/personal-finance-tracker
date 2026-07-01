"use client";

import { useState, useCallback } from "react";
import type { Transaction, PaginatedResult } from "@/types/transaction";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

interface Props {
  initialTransactions: PaginatedResult<Transaction>;
}

export default function Dashboard({ initialTransactions }: Props) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleEdit = useCallback((t: Transaction) => {
    setEditingTransaction(t);
    requestAnimationFrame(() => {
      document.getElementById("transaction-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  function handleDone() {
    setEditingTransaction(null);
  }

  return (
    <>
      <TransactionForm
        key={editingTransaction?.id ?? "new"}
        editingTransaction={editingTransaction}
        onDone={handleDone}
      />
      <TransactionList
        initialTransactions={initialTransactions}
        onEdit={handleEdit}
      />
    </>
  );
}
