import { ROUTES } from '@/shared/constants/routes'

/**
 * Allows only same-origin relative paths for post-login redirects.
 * Blocks protocol-relative URLs, absolute external URLs, and malformed values.
 */
export function getSafeInternalPath(
  candidate: string | null | undefined,
  fallback: string = ROUTES.home,
): string {
  if (!candidate) return fallback

  const trimmed = candidate.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback
  }

  try {
    const url = new URL(trimmed, window.location.origin)
    if (url.origin !== window.location.origin) {
      return fallback
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
