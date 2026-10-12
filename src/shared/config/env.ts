/**
 * Runtime configuration from Vite environment variables.
 * Only VITE_* keys are exposed to the client bundle.
 */
function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL

  if (typeof value !== 'string' || value.trim().length === 0) {
    return ''
  }

  return value.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl: readApiBaseUrl(),
  isDev: import.meta.env.DEV,
} as const
