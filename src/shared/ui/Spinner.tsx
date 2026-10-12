import styles from './Spinner.module.css'

type SpinnerProps = {
  size?: 'sm' | 'md'
  label?: string
}

export function Spinner({ size = 'md', label = 'Завантаження' }: SpinnerProps) {
  return (
    <span
      className={`${styles.root} ${styles[size]}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className={styles.dot} aria-hidden="true" />
    </span>
  )
}
