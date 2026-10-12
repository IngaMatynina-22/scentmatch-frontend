import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '@/shared/ui/Spinner'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'sm'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.root,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" label="Завантаження" /> : null}
      <span className={loading ? styles.labelHidden : undefined}>{children}</span>
    </button>
  )
}
