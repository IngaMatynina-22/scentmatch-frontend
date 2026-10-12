export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  method?: HttpMethod
  path: string
  query?: Record<string, string | number | boolean | null | undefined>
  /** JSON-serializable object or FormData (multipart). */
  body?: unknown
  headers?: Record<string, string>
  /** Override Accept header (default application/json). */
  accept?: string
  /** Skip Authorization header (e.g. login / refresh). */
  skipAuth?: boolean
  /** Skip automatic refresh + retry on 401. */
  skipRefresh?: boolean
  signal?: AbortSignal
}
