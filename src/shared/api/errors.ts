export type ApiErrorCode =
  | 'NETWORK'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'SERVER'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details: unknown

  constructor(
    message: string,
    options: {
      status: number
      code: ApiErrorCode
      details?: unknown
      cause?: unknown
    },
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

export function mapStatusToCode(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 400 || status === 422) return 'VALIDATION'
  if (status >= 500) return 'SERVER'
  return 'UNKNOWN'
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'UNAUTHORIZED'
}
