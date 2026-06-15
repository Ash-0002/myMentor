const DEFAULT_BACKEND_BASE_URL = "http://187.127.132.226:9000"

export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL

export const API_TENANT_ID = ""
export const API_TENANT_NAME = ""

export const API_TENANT_HEADERS = {
  "x-tenant": API_TENANT_ID,
} as const

export function buildBackendApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${BACKEND_BASE_URL}/api${normalizedPath}`
}

export function getBackendHeaders(extra?: HeadersInit): Record<string, string> {
  const headers = new Headers(extra)
  headers.set("x-tenant", API_TENANT_ID)
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key] = value
  })
  return result
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set("x-tenant", API_TENANT_ID)
  return fetch(input, { ...init, headers })
}
