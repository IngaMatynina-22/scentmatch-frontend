import { httpRequest } from '@/shared/api/httpClient'
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from '@/features/auth/model/types'

type RefreshTokenBody = {
  refreshToken: string
}

function mapUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles.map(String) : [],
  }
}

function mapAuthResponse(payload: AuthResponse): AuthResponse {
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt: payload.expiresAt,
    user: mapUser(payload.user),
  }
}

export const authApi = {
  /** POST /api/auth/login */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const payload = await httpRequest<AuthResponse>({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
      skipAuth: true,
      skipRefresh: true,
    })
    return mapAuthResponse(payload)
  },

  /** POST /api/auth/register */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const body: RegisterPayload = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    }
    if (payload.firstName?.trim()) body.firstName = payload.firstName.trim()
    if (payload.lastName?.trim()) body.lastName = payload.lastName.trim()

    const response = await httpRequest<AuthResponse>({
      method: 'POST',
      path: '/api/auth/register',
      body,
      skipAuth: true,
      skipRefresh: true,
    })
    return mapAuthResponse(response)
  },

  /** POST /api/auth/refresh — returns a full AuthResponse (rotated refresh token). */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const body: RefreshTokenBody = { refreshToken }
    const payload = await httpRequest<AuthResponse>({
      method: 'POST',
      path: '/api/auth/refresh',
      body,
      skipAuth: true,
      skipRefresh: true,
    })
    return mapAuthResponse(payload)
  },

  /** POST /api/auth/logout → 204 */
  async logout(refreshToken: string): Promise<void> {
    const body: RefreshTokenBody = { refreshToken }
    await httpRequest<null>({
      method: 'POST',
      path: '/api/auth/logout',
      body,
      skipAuth: true,
      skipRefresh: true,
    })
  },

  /** GET /api/auth/me */
  async me(): Promise<AuthUser> {
    const payload = await httpRequest<AuthUser>({
      method: 'GET',
      path: '/api/auth/me',
    })
    return mapUser(payload)
  },
}

export type { LoginCredentials, RegisterPayload }
