"use client";

import { memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiDelete, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { Transaction, PaginatedResult } from "@/types/transaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/pagination";

interface Props {
  initialTransactions: PaginatedResult<Transaction>;
  onEdit: (t: Transaction) => void;
}

const ALL_CATEGORIES = [
  ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
];
const FILTER_DEBOUNCE_MS = 200;

function TransactionList({ initialTransactions, onEdit }: Props) {
  const router = useRouter();
  const [result, setResult] = useState(initialTransactions);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState<Date | undefined>();
  const [filterTo, setFilterTo] = useState<Date | undefined>();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  function fetchPage(page: number) {
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterCategory) params.set("category", filterCategory);
    if (filterFrom) params.set("from", format(filterFrom, "yyyy-MM-dd"));
    if (filterTo) params.set("to", format(filterTo, "yyyy-MM-dd"));

    params.set("page", String(page));
    params.set("pageSize", "10");

    apiGet<PaginatedResult<Transaction>>(`/api/transactions?${params}`)
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      });
  }

  useEffect(() => {
    fetchPage(1);
  }, [filterType, filterCategory, filterFrom, filterTo]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/transactions/${deleteTarget.id}`);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      setDeleteTarget(null);
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete transaction";
      setError(msg);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Select
            value={filterType || "all"}
            onValueChange={(v) => setFilterType(v === "all" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterCategory || "all"}
            onValueChange={(v) =>
              setFilterCategory(v === "all" ? "" : (v ?? ""))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {ALL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger
              className={cn(
                "h-9 w-36 justify-start text-left font-normal inline-flex items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                !filterFrom && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-3.5 shrink-0" />
              {filterFrom ? (
                format(filterFrom, "MMM d, yyyy")
              ) : (
                <span>From date</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterFrom}
                onSelect={(d) => {
                  setFilterFrom(d ?? undefined);
                  setFromOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger
              className={cn(
                "h-9 w-36 justify-start text-left font-normal inline-flex items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                !filterTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-3.5 shrink-0" />
              {filterTo ? (
                format(filterTo, "MMM d, yyyy")
              ) : (
                <span>To date</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterTo}
                onSelect={(d) => {
                  setFilterTo(d ?? undefined);
                  setToOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        {result.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No transactions found</p>
        ) : (
          <ul className="divide-y">
            {result.data.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <span
                    className={`font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {t.category}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formatDate(t.date)}
                  </span>
                  {t.note && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      &mdash; {t.note}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(t)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onPageChange={fetchPage}
        />
      </CardContent>
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogPopup>
          <DialogTitle>Delete transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {deleteTarget?.type} of{" "}
            {deleteTarget ? formatCurrency(deleteTarget.amount) : ""}? This
            action cannot be undone.
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </Card>
  );
}

export default memo(TransactionList);
