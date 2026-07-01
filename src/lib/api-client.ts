export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options
  const res = await fetch(path, {
    method,
    signal,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = res.headers.get("content-type") ?? ""
  let data: unknown
  if (contentType.includes("application/json")) {
    data = await res.json()
  } else if (res.status !== 204) {
    const text = await res.text()
    if (text) throw new ApiError(text, res.status)
  }

  if (!res.ok) {
    const payload = data as { error?: string; details?: unknown } | undefined
    throw new ApiError(payload?.error ?? "Request failed", res.status, payload?.details)
  }
  return data as T
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { signal })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body })
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PUT", body })
}

export function apiDelete(path: string, signal?: AbortSignal): Promise<void> {
  return apiRequest<void>(path, { method: "DELETE", signal })
}