import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'
import styles from './StateBlock.module.css'

type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
  action?: ReactNode
}

export function ErrorState({
  title = 'Сталася помилка',
  message = 'Спробуйте ще раз пізніше.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.root} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <div className={styles.actionSlot}>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Повторити
          </Button>
        </div>
      ) : null}
      {action ? <div className={styles.actionSlot}>{action}</div> : null}
    </div>
  )
}
