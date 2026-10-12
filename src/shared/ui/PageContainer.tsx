import type { ReactNode } from 'react'
import styles from './PageContainer.module.css'

type PageContainerProps = {
  title: string
  description?: string
  children?: ReactNode
  narrow?: boolean
}

export function PageContainer({
  title,
  description,
  children,
  narrow = false,
}: PageContainerProps) {
  return (
    <div className={`${styles.root} ${narrow ? styles.narrow : ''}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  )
}
