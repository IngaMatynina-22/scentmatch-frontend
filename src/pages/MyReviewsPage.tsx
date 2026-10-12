import { useEffect, useState } from 'react'
import { ConfirmDeletePanel } from '@/features/collections'
import { reviewsApi, type OwnReview } from '@/features/reviews'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './MyReviewsPage.module.css'

const PAGE_SIZE = 10

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function statusTone(status: string): 'accent' | 'neutral' | 'danger' {
  if (status === 'Approved') return 'accent'
  if (status === 'Rejected') return 'danger'
  return 'neutral'
}

export function MyReviewsPage() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<OwnReview> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await reviewsApi.getMine(
          { page, pageSize: PAGE_SIZE, sortBy: 'createdAt', sortOrder: 'desc' },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити ваші відгуки.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  async function handleDelete() {
    if (deleteId == null || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await reviewsApi.remove(deleteId)
      setDeleteId(null)
      if (result && result.items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      } else {
        setReloadToken((value) => value + 1)
      }
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити відгук.'))
    } finally {
      setDeleting(false)
    }
  }

  const items = result?.items ?? []

  return (
    <PageContainer
      title="Мої відгуки"
      description="Усі ваші оцінки з /api/reviews/mine. Редагувати можна на сторінці парфуму."
    >
      {deleteId != null ? (
        <div className={styles.confirm}>
          <ConfirmDeletePanel
            title="Видалити відгук?"
            message="Відгук буде видалено без можливості відновлення."
            confirming={deleting}
            error={deleteError}
            onConfirm={() => void handleDelete()}
            onCancel={() => setDeleteId(null)}
          />
        </div>
      ) : null}

      {loading ? <LoadingState label="Завантаження відгуків…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Відгуків ще немає"
          message="Відкрийте картку парфуму й залиште оцінку."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {items.map((review) => (
              <li key={review.id} className={styles.item}>
                <div className={styles.header}>
                  <h3 className={styles.name}>
                    {review.perfumeName ?? `Парфум #${review.perfumeId}`}
                  </h3>
                  <Badge tone={statusTone(review.status)}>{review.status}</Badge>
                </div>
                <p className={styles.meta}>
                  ★ {review.rating} · {formatDate(review.createdAt)}
                </p>
                {review.text ? <p className={styles.text}>{review.text}</p> : null}
                <div className={styles.actions}>
                  <ButtonLink to={perfumeDetailsPath(review.perfumeId)} size="sm" variant="ghost">
                    Відкрити
                  </ButtonLink>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeleteId(review.id)
                      setDeleteError(null)
                    }}
                  >
                    Видалити
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {result && result.totalPages > 1 ? (
            <CatalogPagination
              page={result.page}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : null}
    </PageContainer>
  )
}
