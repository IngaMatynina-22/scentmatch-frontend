import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Field.module.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
}

export function Input({
  label,
  hint,
  error,
  id,
  className,
  disabled,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={[styles.control, error ? styles.invalid : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
