export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T = unknown>(url: string, options: RequestInit = {}, logout?: () => void): Promise<T> {
  const token = localStorage.getItem("token")

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  })

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      if (logout) {
        logout()
      }
      throw new ApiError(401, "Unauthorized")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, error instanceof Error ? error.message : "Network error")
  }
}

export const api = {
  get: <T = unknown>(url: string, logout?: () => void) => apiRequest<T>(url, { method: "GET" }, logout),

  post: <T = unknown>(url: string, data?: unknown, logout?: () => void) =>
    apiRequest<T>(
      url,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      logout
    ),

  put: <T = unknown>(url: string, data?: unknown, logout?: () => void) =>
    apiRequest<T>(
      url,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      logout
    ),

  delete: <T = unknown>(url: string, logout?: () => void) => apiRequest<T>(url, { method: "DELETE" }, logout),
}
