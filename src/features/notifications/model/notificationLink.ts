import type { NotificationItem } from '@/features/notifications/model/types'
import { perfumeDetailsPath, ROUTES } from '@/shared/constants/routes'

export type NotificationLink = {
  to: string
  label: string
}

/** Resolve in-app navigation from notification type / perfumeId. */
export function resolveNotificationLink(
  notification: NotificationItem,
): NotificationLink | null {
  if (notification.perfumeId != null && notification.perfumeId > 0) {
    return {
      to: perfumeDetailsPath(notification.perfumeId),
      label: 'Відкрити парфум',
    }
  }

  if (notification.type === 'Recommendation') {
    return {
      to: ROUTES.recommendations,
      label: 'До рекомендацій',
    }
  }

  if (notification.type === 'NewPerfume' || notification.type === 'CatalogUpdate') {
    return {
      to: ROUTES.catalog,
      label: 'До каталогу',
    }
  }

  return null
}
