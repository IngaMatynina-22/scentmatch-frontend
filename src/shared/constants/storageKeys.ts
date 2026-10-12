/**
 * Storage keys for client-persisted session data.
 *
 * Trade-off (documented because backend contracts are not in this repo):
 * - If the API returns refresh/access tokens in the response body for client storage,
 *   sessionStorage limits XSS exposure to the tab lifetime (vs localStorage).
 * - If the API uses HttpOnly cookies for refresh (or both) tokens, remove client token
 *   persistence and rely on credentials: 'include' + CSRF protection instead.
 */
export const STORAGE_KEYS = {
  accessToken: 'scentmatch.accessToken',
  refreshToken: 'scentmatch.refreshToken',
  tokenExpiresAt: 'scentmatch.tokenExpiresAt',
  theme: 'scentmatch.theme',
  compareSelection: 'scentmatch.compareSelection',
} as const
