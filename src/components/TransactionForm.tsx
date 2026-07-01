"use client";

import { useState } from "react";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";
import { useEditingStore } from "@/stores/editing-store";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function TransactionFormInner() {
  const editingTransaction = useEditingStore((s) => s.editingTransaction);
  const setEditing = useEditingStore((s) => s.setEditing);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<"income" | "expense">(
    editingTransaction?.type ?? "expense",
  );
  const [amount, setAmount] = useState(
    editingTransaction ? editingTransaction.amount.toString() : "",
  );
  const [category, setCategory] = useState(editingTransaction?.category ?? "");
  const [date, setDate] = useState<Date>(
    editingTransaction
      ? new Date(editingTransaction.date + "T00:00:00")
      : new Date(),
  );
  const [note, setNote] = useState(editingTransaction?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isSubmitDisabled = !amount || parseFloat(amount) <= 0 || !category;

  function resetForm() {
    setType("expense");
    setAmount("");
    setCategory("");
    setDate(new Date());
    setNote("");
    setError(null);
  }

  function handleTypeChange(value: "income" | "expense") {
    setType(value);
    setCategory("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const body = {
      type,
      amount: parsedAmount,
      category: category as Category,
      date: format(date, "yyyy-MM-dd"),
      note: note || undefined,
    };

    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          ...body,
        });
        setEditing(null);
      } else {
        await createMutation.mutateAsync(body);
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card id="transaction-form" className="mb-6 border shadow-sm">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="amount"
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground/40">
                ฿
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseFloat(val) >= 0) setAmount(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                required
                className="h-16 pl-14 text-4xl font-bold tracking-tight"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase text-muted-foreground">
              Type
            </Label>
            <div className="flex gap-1.5 rounded-lg bg-muted p-1">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    type === t
                      ? t === "expense"
                        ? "bg-destructive text-destructive-foreground shadow-sm"
                        : "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "expense" ? "− Expense" : "+ Income"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v ?? "")}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                Date
              </Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  className={cn(
                    "h-10 w-full justify-start text-left font-normal inline-flex items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="note"
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Note
            </Label>
            <textarea
              id="note"
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              className="flex-1 sm:flex-none"
              disabled={isSubmitDisabled || isPending}
            >
              {isPending
                ? "Saving…"
                : editingTransaction
                  ? "Update Transaction"
                  : "Add Transaction"}
            </Button>
            {editingTransaction && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                className="flex-1 sm:flex-none"
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function TransactionForm() {
  const editingTransaction = useEditingStore((s) => s.editingTransaction);
  return <TransactionFormInner key={editingTransaction?.id ?? "new"} />;
}
