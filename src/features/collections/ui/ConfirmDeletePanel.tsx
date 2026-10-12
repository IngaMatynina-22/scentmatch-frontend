import { Button } from '@/shared/ui/Button'
import styles from './ConfirmDeletePanel.module.css'

type ConfirmDeletePanelProps = {
  title: string
  message: string
  confirming: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeletePanel({
  title,
  message,
  confirming,
  error,
  onConfirm,
  onCancel,
}: ConfirmDeletePanelProps) {
  return (
    <div className={styles.root} role="alertdialog" aria-labelledby="confirm-delete-title">
      <h2 id="confirm-delete-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.message}>{message}</p>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button type="button" variant="danger" loading={confirming} disabled={confirming} onClick={onConfirm}>
          Видалити
        </Button>
        <Button type="button" variant="ghost" disabled={confirming} onClick={onCancel}>
          Скасувати
        </Button>
      </div>
    </div>
  )
}
