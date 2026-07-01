import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { summaryKeys } from "@/lib/query-keys";
import type { SummaryResponse } from "@/types/transaction";

export function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: summaryKeys.range(from, to),
    queryFn: () =>
      apiGet<SummaryResponse>(`/api/summary?from=${from}&to=${to}`),
    staleTime: 5 * 60 * 1000,
  });
}
