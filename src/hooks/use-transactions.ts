import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { transactionKeys } from "@/lib/query-keys";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  PaginatedResult,
} from "@/types/transaction";

function buildParams(
  filters: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useTransactions(
  filters: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => {
      const qs = buildParams(filters);
      return apiGet<PaginatedResult<Transaction>>(`/api/transactions?${qs}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      apiPost<Transaction>("/api/transactions", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTransactionInput & { id: string }) =>
      apiPut<Transaction>(`/api/transactions/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}
