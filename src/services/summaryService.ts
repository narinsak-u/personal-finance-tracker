import * as transactionRepository from "@/repositories/transactionRepository";
import { summaryQuerySchema } from "@/schemas/transactionSchema";
import { parseOrThrow } from "@/lib/errors";
import type { SummaryResponse, Category } from "@/types/transaction";

// Validates date range, fetches aggregated totals + category breakdown, computes net balance
export async function getSummary(
  from: string,
  to: string,
): Promise<SummaryResponse> {
  const validated = parseOrThrow(summaryQuerySchema, { from, to });

  const data = await transactionRepository.getSummary(
    validated.from,
    validated.to,
  );

  const totalIncome =
    data.totals.find((t) => t.type === "income")?.total ?? 0;
  const totalExpense =
    data.totals.find((t) => t.type === "expense")?.total ?? 0;

  return {
    from: validated.from,
    to: validated.to,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    byCategory: data.byCategory.map((item) => ({
      type: item.type,
      category: item.category as Category,
      total: item.total,
    })),
  };
}
