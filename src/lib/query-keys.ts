export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: Record<string, string | number | undefined>) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

export const summaryKeys = {
  all: ["summary"] as const,
  range: (from: string, to: string) => [...summaryKeys.all, from, to] as const,
};
