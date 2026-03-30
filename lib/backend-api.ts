const DEFAULT_BACKEND_BASE_URL = "http://187.127.132.226:8000"

export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL

export function buildBackendApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${BACKEND_BASE_URL}/api${normalizedPath}`
}
