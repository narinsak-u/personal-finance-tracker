"use client";

import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default function Dashboard() {
  return (
    <>
      <TransactionForm />
      <TransactionList />
    </>
  );
}
