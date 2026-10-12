import { createContext } from 'react'

export type NotificationsContextValue = {
  unreadCount: number
  isLoading: boolean
  error: string | null
  refreshUnreadCount: () => Promise<void>
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
)
