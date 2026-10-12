import type { Review, ReviewQuery, ReviewSortBy, SortOrder } from '@/entities/perfume'
import type { PagedResult } from '@/shared/api/paging'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Select } from '@/shared/ui/Select'
import { Skeleton } from '@/shared/ui/Skeleton'
import styles from './PerfumeReviewsList.module.css'

type PerfumeReviewsListProps = {
  result: PagedResult<Review> | null
  loading: boolean
  error: string | null
  query: ReviewQuery
  onQueryChange: (patch: Partial<ReviewQuery>) => void
  onRetry: () => void
}

function formatDate(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function PerfumeReviewsList({
  result,
  loading,
  error,
  query,
  onQueryChange,
  onRetry,
}: PerfumeReviewsListProps) {
  return (
    <section className={styles.root} aria-labelledby="reviews-title">
      <div className={styles.header}>
        <h2 id="reviews-title" className={styles.title}>
          Відгуки
        </h2>
        <div className={styles.controls}>
          <Select
            label="Сортування"
            name="reviewSortBy"
            value={query.sortBy ?? 'date'}
            onChange={(event) =>
              onQueryChange({
                sortBy: event.target.value as ReviewSortBy,
                page: 1,
              })
            }
            options={[
              { value: 'date', label: 'Дата' },
              { value: 'rating', label: 'Рейтинг' },
            ]}
          />
          <Select
            label="Напрямок"
            name="reviewSortOrder"
            value={query.sortOrder ?? 'desc'}
            onChange={(event) =>
              onQueryChange({
                sortOrder: event.target.value as SortOrder,
                page: 1,
              })
            }
            options={[
              { value: 'desc', label: 'Спочатку нові / вищі' },
              { value: 'asc', label: 'Спочатку старі / нижчі' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonStack}>
          <Skeleton height="5rem" radius="lg" />
          <Skeleton height="5rem" radius="lg" />
        </div>
      ) : null}

      {!loading && error ? (
        <ErrorState title="Не вдалося завантажити відгуки" message={error} onRetry={onRetry} />
      ) : null}

      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState title="Поки немає відгуків" message="Схвалені відгуки з’являться тут." />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {result.items.map((review) => (
              <li key={review.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <strong>{review.user.username}</strong>
                  <span className={styles.rating}>★ {review.rating}</span>
                </div>
                {review.createdAt ? (
                  <p className={styles.date}>{formatDate(review.createdAt)}</p>
                ) : null}
                {review.text ? <p className={styles.text}>{review.text}</p> : null}
              </li>
            ))}
          </ul>

          {result.totalPages > 1 ? (
            <div className={styles.pagination}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={result.page <= 1}
                onClick={() => onQueryChange({ page: result.page - 1 })}
              >
                Назад
              </Button>
              <span>
                {result.page} / {result.totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={result.page >= result.totalPages}
                onClick={() => onQueryChange({ page: result.page + 1 })}
              >
                Далі
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
