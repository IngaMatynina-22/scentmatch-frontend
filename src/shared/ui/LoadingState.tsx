import { Spinner } from '@/shared/ui/Spinner'
import styles from './StateBlock.module.css'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Завантаження…' }: LoadingStateProps) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Spinner label={label} />
      <p className={styles.title}>{label}</p>
    </div>
  )
}
