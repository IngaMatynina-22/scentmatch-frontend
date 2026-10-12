import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './IconButton.module.css'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
}

export function IconButton({
  label,
  children,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={[styles.root, className ?? ''].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  )
}
