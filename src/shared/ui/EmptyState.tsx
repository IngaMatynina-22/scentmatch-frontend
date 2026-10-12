import type { ReactNode } from 'react'
import styles from './StateBlock.module.css'

type EmptyStateProps = {
  title?: string
  message?: string
  action?: ReactNode
}

export function EmptyState({
  title = 'Порожньо',
  message = 'Тут поки немає даних.',
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {action ? <div className={styles.actionSlot}>{action}</div> : null}
    </div>
  )
}
