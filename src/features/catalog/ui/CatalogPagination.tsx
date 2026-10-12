import { Button } from '@/shared/ui/Button'
import styles from './CatalogPagination.module.css'

type CatalogPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({
  page,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.root} aria-label="Пагінація каталогу">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </Button>

      <p className={styles.status}>
        Сторінка {page} з {totalPages}
      </p>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Далі
      </Button>
    </nav>
  )
}
