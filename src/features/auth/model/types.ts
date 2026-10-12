/**
 * Auth domain types aligned with ScentMatch.Application.Auth.DTOs
 * and Domain.Constants.AppRoles from scentmatch-backend.
 */

export const USER_ROLES = {
  User: 'User',
  Admin: 'Admin',
} as const

export type KnownUserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/** Backend may return only known roles; unknown strings never grant privileges. */
export type AuthUser = {
  id: number
  username: string
  email: string
  roles: string[]
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: AuthUser
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export function hasAdminRole(user: AuthUser | null | undefined): boolean {
  return user?.roles.includes(USER_ROLES.Admin) ?? false
}

export function hasKnownAccessRole(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  return user.roles.some(
    (role) => role === USER_ROLES.User || role === USER_ROLES.Admin,
  )
}
