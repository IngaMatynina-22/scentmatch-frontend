import { useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi } from '@/features/auth/api/authApi'
import { AuthContext } from '@/features/auth/model/auth-context'
import { tokenStorage } from '@/features/auth/model/tokenStorage'
import {
  hasAdminRole,
  type AuthTokens,
  type AuthUser,
  type LoginCredentials,
  type RegisterPayload,
} from '@/features/auth/model/types'
import { ApiError, isUnauthorizedError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { configureHttpClient } from '@/shared/api/httpClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const restoreIdRef = useRef(0)

  function clearSession() {
    tokenStorage.clear()
    setTokens(null)
    setUser(null)
    setSessionError(null)
  }

  function establishSession(nextUser: AuthUser, nextTokens: AuthTokens) {
    tokenStorage.write(nextTokens)
    setTokens(nextTokens)
    setUser(nextUser)
    setSessionError(null)
  }

  useEffect(() => {
    configureHttpClient({
      getAccessToken: () => tokenStorage.read()?.accessToken ?? null,
      refreshAccessToken: async () => {
        const current = tokenStorage.read()
        if (!current?.refreshToken) {
          throw new ApiError('Missing refresh token', {
            status: 401,
            code: 'UNAUTHORIZED',
          })
        }

        const refreshed = await authApi.refresh(current.refreshToken)
        const nextTokens: AuthTokens = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
        }
        tokenStorage.write(nextTokens)
        setTokens(nextTokens)
        setUser(refreshed.user)
        return nextTokens.accessToken
      },
      onSessionInvalid: () => {
        tokenStorage.clear()
        setTokens(null)
        setUser(null)
      },
    })
  }, [])

  async function restoreSession() {
    const requestId = ++restoreIdRef.current
    const stored = tokenStorage.read()

    if (!stored) {
      if (requestId === restoreIdRef.current) {
        setTokens(null)
        setUser(null)
        setSessionError(null)
        setIsLoading(false)
      }
      return
    }

    setTokens(stored)
    setIsLoading(true)
    setSessionError(null)

    try {
      const me = await authApi.me()
      if (requestId !== restoreIdRef.current) return
      setUser(me)
      setSessionError(null)
    } catch (error) {
      if (requestId !== restoreIdRef.current) return

      if (isUnauthorizedError(error)) {
        clearSession()
        return
      }

      if (error instanceof ApiError && error.code === 'NETWORK') {
        setSessionError(
          getApiErrorMessage(
            error,
            'Не вдалося перевірити сесію. Спробуйте ще раз.',
          ),
        )
        return
      }

      clearSession()
    } finally {
      if (requestId === restoreIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void restoreSession()
  }, [])

  async function login(credentials: LoginCredentials): Promise<void> {
    const result = await authApi.login(credentials)
    establishSession(result.user, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
    })
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const result = await authApi.register(payload)
    establishSession(result.user, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
    })
  }

  async function logout(): Promise<void> {
    const refreshToken = tokens?.refreshToken ?? tokenStorage.read()?.refreshToken
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Always clear local session even if the API call fails.
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: hasAdminRole(user),
        isLoading,
        sessionError,
        login,
        register,
        logout,
        retrySessionRestore: restoreSession,
        establishSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
