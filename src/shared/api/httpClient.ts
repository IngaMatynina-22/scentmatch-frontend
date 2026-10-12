import { env } from '@/shared/config/env'
import { ApiError, mapStatusToCode } from '@/shared/api/errors'
import type { RequestOptions } from '@/shared/api/types'

export type TokenAccessor = {
  getAccessToken: () => string | null
  /**
   * Single-flight refresh. Must resolve to a new access token or reject.
   * Concurrent 401s should await the same in-flight promise.
   */
  refreshAccessToken: () => Promise<string>
  onSessionInvalid: () => void
}

let tokenAccessor: TokenAccessor | null = null
let refreshPromise: Promise<string> | null = null

export function configureHttpClient(accessor: TokenAccessor): void {
  tokenAccessor = accessor
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = env.apiBaseUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`, base || window.location.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

async function runRefresh(): Promise<string> {
  if (!tokenAccessor) {
    throw new ApiError('Auth token accessor is not configured', {
      status: 401,
      code: 'UNAUTHORIZED',
    })
  }

  if (!refreshPromise) {
    refreshPromise = tokenAccessor
      .refreshAccessToken()
      .catch((error: unknown) => {
        tokenAccessor?.onSessionInvalid()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function httpRequest<T>(options: RequestOptions): Promise<T> {
  if (!env.apiBaseUrl && !options.path.startsWith('http')) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Copy .env.example to .env and set the API URL.',
      { status: 0, code: 'NETWORK' },
    )
  }

  const headers: Record<string, string> = {
    Accept: options.accept ?? 'application/json',
    ...options.headers,
  }

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (!options.skipAuth) {
    const accessToken = tokenAccessor?.getAccessToken()
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }

  let response: Response

  try {
    response = await fetch(buildUrl(options.path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (cause) {
    throw new ApiError('Network request failed', {
      status: 0,
      code: 'NETWORK',
      cause,
    })
  }

  if (
    response.status === 401 &&
    !options.skipAuth &&
    !options.skipRefresh &&
    tokenAccessor
  ) {
    try {
      const nextAccessToken = await runRefresh()
      return httpRequest<T>({
        ...options,
        skipRefresh: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${nextAccessToken}`,
        },
      })
    } catch {
      // Session cleared in runRefresh; surface as unauthorized.
      throw new ApiError('Session expired', {
        status: 401,
        code: 'UNAUTHORIZED',
      })
    }
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}`

    throw new ApiError(message, {
      status: response.status,
      code: mapStatusToCode(response.status),
      details: payload,
    })
  }

  return payload as T
}

export type BlobDownload = {
  blob: Blob
  fileName: string | null
  contentType: string | null
}

/** Binary / file download with the same auth + refresh behaviour as httpRequest. */
export async function httpRequestBlob(
  options: Omit<RequestOptions, 'accept'> & { accept?: string },
): Promise<BlobDownload> {
  if (!env.apiBaseUrl && !options.path.startsWith('http')) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Copy .env.example to .env and set the API URL.',
      { status: 0, code: 'NETWORK' },
    )
  }

  const headers: Record<string, string> = {
    Accept: options.accept ?? '*/*',
    ...options.headers,
  }

  if (!options.skipAuth) {
    const accessToken = tokenAccessor?.getAccessToken()
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }

  let response: Response
  try {
    response = await fetch(buildUrl(options.path, options.query), {
      method: options.method ?? 'GET',
      headers,
      signal: options.signal,
    })
  } catch (cause) {
    throw new ApiError('Network request failed', {
      status: 0,
      code: 'NETWORK',
      cause,
    })
  }

  if (
    response.status === 401 &&
    !options.skipAuth &&
    !options.skipRefresh &&
    tokenAccessor
  ) {
    try {
      const nextAccessToken = await runRefresh()
      return httpRequestBlob({
        ...options,
        skipRefresh: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${nextAccessToken}`,
        },
      })
    } catch {
      throw new ApiError('Session expired', {
        status: 401,
        code: 'UNAUTHORIZED',
      })
    }
  }

  if (!response.ok) {
    const payload = await parseBody(response)
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}`

    throw new ApiError(message, {
      status: response.status,
      code: mapStatusToCode(response.status),
      details: payload,
    })
  }

  const disposition = response.headers.get('content-disposition')
  let fileName: string | null = null
  if (disposition) {
    const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
    const plainMatch = /filename="?([^";]+)"?/i.exec(disposition)
    fileName = decodeURIComponent(
      (utfMatch?.[1] ?? plainMatch?.[1] ?? '').trim(),
    )
    if (!fileName) fileName = null
  }

  return {
    blob: await response.blob(),
    fileName,
    contentType: response.headers.get('content-type'),
  }
}
