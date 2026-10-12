import { useContext } from 'react'
import { NotificationsContext } from '@/features/notifications/model/notifications-context'

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
