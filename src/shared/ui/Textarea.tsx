import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import styles from './Field.module.css'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: ReactNode
  error?: string
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 4,
  ...rest
}: TextareaProps) {
  const generatedId = useId()
  const areaId = id ?? generatedId
  const hintId = hint ? `${areaId}-hint` : undefined
  const errorId = error ? `${areaId}-error` : undefined

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={areaId}>
        {label}
      </label>
      <textarea
        id={areaId}
        rows={rows}
        className={[styles.control, styles.textarea, error ? styles.invalid : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
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
