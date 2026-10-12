import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { AuthTokens } from '@/features/auth/model/types'

/**
 * Client-side token persistence for JSON-body JWT auth
 * (ScentMatch API returns accessToken + refreshToken in AuthResponse).
 *
 * Trade-off: sessionStorage is readable by XSS in the same tab; HttpOnly cookies
 * are not used by the current backend. Prefer short-lived access tokens + refresh rotation.
 * Tokens are never logged.
 */
export const tokenStorage = {
  read(): AuthTokens | null {
    const accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken)
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.refreshToken)
    const expiresAt = sessionStorage.getItem(STORAGE_KEYS.tokenExpiresAt)

    if (!accessToken || !refreshToken || !expiresAt) return null

    return { accessToken, refreshToken, expiresAt }
  },

  write(tokens: AuthTokens): void {
    sessionStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken)
    sessionStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken)
    sessionStorage.setItem(STORAGE_KEYS.tokenExpiresAt, tokens.expiresAt)
  },

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEYS.accessToken)
    sessionStorage.removeItem(STORAGE_KEYS.refreshToken)
    sessionStorage.removeItem(STORAGE_KEYS.tokenExpiresAt)
  },
}
