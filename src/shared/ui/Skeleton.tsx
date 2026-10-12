import styles from './Skeleton.module.css'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  radius?: 'sm' | 'md' | 'lg' | 'pill'
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className,
}: SkeletonProps) {
  return (
    <span
      className={[styles.root, styles[radius], className ?? ''].filter(Boolean).join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
