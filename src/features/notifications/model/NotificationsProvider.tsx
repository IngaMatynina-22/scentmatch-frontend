import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { NotificationsContext } from '@/features/notifications/model/notifications-context'
import { getApiErrorMessage } from '@/shared/api/errorMessage'

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await notificationsApi.getUnreadCount()
      setUnreadCount(response.count)
    } catch (err) {
      setUnreadCount(0)
      setError(getApiErrorMessage(err, 'Не вдалося завантажити лічильник сповіщень.'))
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setUnreadCount(0)
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await notificationsApi.getUnreadCount(controller.signal)
        if (!controller.signal.aborted) {
          setUnreadCount(response.count)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setUnreadCount(0)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити лічильник сповіщень.'))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [isAuthenticated, authLoading])

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        isLoading,
        error,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
