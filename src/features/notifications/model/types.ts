/** NotificationDto */
export type NotificationItem = {
  id: number
  perfumeId: number | null
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string | null
}

/** UnreadNotificationCountDto */
export type UnreadNotificationCount = {
  count: number
}

/** Domain.Constants.NotificationTypes */
export const NOTIFICATION_TYPES = [
  'System',
  'Review',
  'Recommendation',
  'Info',
  'NewPerfume',
  'RatingChanged',
  'CatalogUpdate',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  System: 'Система',
  Review: 'Модерація відгуку',
  Recommendation: 'Рекомендації',
  Info: 'Інформація',
  NewPerfume: 'Новий парфум',
  RatingChanged: 'Зміна рейтингу',
  CatalogUpdate: 'Оновлення каталогу',
}

export function getNotificationTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? type
}
