import { createContext } from 'react'
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from '@/features/auth/model/types'

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  sessionError: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  retrySessionRestore: () => Promise<void>
  establishSession: (user: AuthUser, tokens: AuthTokens) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
