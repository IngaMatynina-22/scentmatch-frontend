import type { NotificationItem } from '@/features/notifications/model/types'
import { getNotificationTypeLabel } from '@/features/notifications/model/types'
import { resolveNotificationLink } from '@/features/notifications/model/notificationLink'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import styles from './NotificationCard.module.css'

type NotificationCardProps = {
  notification: NotificationItem
  marking: boolean
  deleting: boolean
  onMarkRead: () => void
  onDelete: () => void
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Дата невідома'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Дата невідома'
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function NotificationCard({
  notification,
  marking,
  deleting,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const link = resolveNotificationLink(notification)
  const busy = marking || deleting

  return (
    <article
      className={[styles.root, notification.isRead ? styles.read : styles.unread]
        .filter(Boolean)
        .join(' ')}
      aria-label={notification.title}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.type}>{getNotificationTypeLabel(notification.type)}</p>
          <h2 className={styles.title}>{notification.title}</h2>
        </div>
        <time className={styles.date} dateTime={notification.createdAt ?? undefined}>
          {formatDateTime(notification.createdAt)}
        </time>
      </header>

      <p className={styles.message}>{notification.message}</p>

      <div className={styles.actions}>
        {link ? (
          <ButtonLink to={link.to} size="sm" variant="accent">
            {link.label}
          </ButtonLink>
        ) : null}

        {!notification.isRead ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            loading={marking}
            disabled={busy}
            onClick={onMarkRead}
          >
            Позначити прочитаним
          </Button>
        ) : (
          <span className={styles.readLabel}>Прочитано</span>
        )}

        <Button
          type="button"
          size="sm"
          variant="danger"
          loading={deleting}
          disabled={busy}
          onClick={onDelete}
        >
          Видалити
        </Button>
      </div>
    </article>
  )
}
