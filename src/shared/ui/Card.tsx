import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'md' | 'lg'
}

export function Card({ children, padding = 'md', className, ...rest }: CardProps) {
  return (
    <div
      className={[styles.root, styles[padding], className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
