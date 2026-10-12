import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Choice.module.css'

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
}

export function Radio({ label, id, className, ...rest }: RadioProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label className={[styles.root, className ?? ''].filter(Boolean).join(' ')} htmlFor={inputId}>
      <input id={inputId} type="radio" className={styles.input} {...rest} />
      <span className={`${styles.box} ${styles.radio}`} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
