import type { PerfumeQuery, PerfumeSortBy, SortOrder } from '@/entities/perfume'
import { Select } from '@/shared/ui/Select'
import styles from './CatalogToolbar.module.css'

type CatalogToolbarProps = {
  query: PerfumeQuery
  totalItems: number
  onChange: (patch: Partial<PerfumeQuery>, options?: { resetPage?: boolean }) => void
}

export function CatalogToolbar({ query, totalItems, onChange }: CatalogToolbarProps) {
  return (
    <div className={styles.root}>
      <p className={styles.total} aria-live="polite">
        Знайдено: <strong>{totalItems}</strong>
      </p>

      <div className={styles.controls}>
        <Select
          label="Сортування"
          name="sortBy"
          value={query.sortBy ?? 'name'}
          onChange={(event) =>
            onChange(
              { sortBy: event.target.value as PerfumeSortBy },
              { resetPage: true },
            )
          }
          options={[
            { value: 'name', label: 'Назва' },
            { value: 'brand', label: 'Бренд' },
            { value: 'price', label: 'Ціна' },
            { value: 'rating', label: 'Рейтинг' },
            { value: 'releaseYear', label: 'Рік' },
          ]}
        />

        <Select
          label="Напрямок"
          name="sortOrder"
          value={query.sortOrder ?? 'asc'}
          onChange={(event) =>
            onChange(
              { sortOrder: event.target.value as SortOrder },
              { resetPage: true },
            )
          }
          options={[
            { value: 'asc', label: 'За зростанням' },
            { value: 'desc', label: 'За спаданням' },
          ]}
        />

        <Select
          label="На сторінці"
          name="pageSize"
          value={String(query.pageSize ?? 20)}
          onChange={(event) =>
            onChange(
              { pageSize: Number.parseInt(event.target.value, 10) },
              { resetPage: true },
            )
          }
          options={[
            { value: '12', label: '12' },
            { value: '20', label: '20' },
            { value: '40', label: '40' },
          ]}
        />
      </div>
    </div>
  )
}
