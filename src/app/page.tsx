import type { Metadata } from "next"
import { format } from "date-fns"
import dynamicImport from "next/dynamic"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { transactionKeys, summaryKeys } from "@/lib/query-keys"
import * as summaryService from "@/services/summaryService"
import * as transactionService from "@/services/transactionService"
import SummaryCards from "@/components/SummaryCards"
import Dashboard from "@/components/Dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Personal Finance Tracker",
  description: "Track your income and expense transactions",
}

const CategoryBreakdown = dynamicImport(
  () => import("@/components/CategoryBreakdown"),
  {
    ssr: true,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-9 rounded-lg border bg-card animate-pulse" />
        <div className="h-9 rounded-lg border bg-card animate-pulse" />
      </div>
    ),
  },
)

export default async function Home() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const to = now.toISOString().split("T")[0]

  const queryClient = getQueryClient()

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: summaryKeys.range(from, to),
      queryFn: () => summaryService.getSummary(from, to),
    }),
    queryClient.prefetchQuery({
      queryKey: transactionKeys.list({ page: 1, pageSize: 10 }),
      queryFn: () => transactionService.list({ page: 1, pageSize: 10 }),
    }),
  ])

  let summary
  try {
    summary = await summaryService.getSummary(from, to)
  } catch {
    summary = {
      from,
      to,
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      byCategory: [],
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Personal Finance Tracker</h1>
        <p className="text-sm text-gray-500 mb-4">
          Summary for {format(new Date(from + "T00:00:00"), "MMMM d, yyyy")} to{" "}
          {format(new Date(to + "T00:00:00"), "MMMM d, yyyy")}
        </p>
        <SummaryCards summary={summary} />
        <CategoryBreakdown byCategory={summary.byCategory} />
        <Dashboard />
      </main>
    </HydrationBoundary>
  )
}