import { Link, type LinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonLinkVariant = 'primary' | 'accent' | 'ghost' | 'danger'

type ButtonLinkProps = LinkProps & {
  variant?: ButtonLinkVariant
  size?: 'md' | 'sm'
  fullWidth?: boolean
  children: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
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
    <Link className={classes} {...rest}>
      {children}
    </Link>
  )
}
