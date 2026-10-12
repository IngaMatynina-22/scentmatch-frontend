import { Link } from 'react-router-dom'
import { useComparison } from '@/features/comparison'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import styles from './ComparisonSelectionList.module.css'

type ComparisonSelectionListProps = {
  onClear?: () => void
}

export function ComparisonSelectionList({ onClear }: ComparisonSelectionListProps) {
  const { items, remove, clear, count } = useComparison()

  if (count === 0) return null

  function handleClear() {
    clear()
    onClear?.()
  }

  return (
    <section className={styles.root} aria-label="Обрані для порівняння">
      <div className={styles.header}>
        <h2 className={styles.title}>Обрано: {count}</h2>
        <Button type="button" size="sm" variant="ghost" onClick={handleClear}>
          Очистити все
        </Button>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.meta}>
              <Link to={perfumeDetailsPath(item.id)} className={styles.name}>
                {item.name}
              </Link>
              {item.brandName ? (
                <span className={styles.brand}>{item.brandName}</span>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => remove(item.id)}
              aria-label={`Прибрати ${item.name} з порівняння`}
            >
              Прибрати
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
