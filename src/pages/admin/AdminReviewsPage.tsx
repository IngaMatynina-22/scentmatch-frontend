import { useEffect, useState } from 'react'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminReview } from '@/features/admin/model/types'
import { REVIEW_STATUSES } from '@/features/admin/model/types'
import { ConfirmDeletePanel } from '@/features/collections'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Select } from '@/shared/ui/Select'
import styles from './AdminReviewsPage.module.css'

export function AdminReviewsPage() {
  const [status, setStatus] = useState('Pending')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<AdminReview> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await adminApi.getReviews(
          { status: status || undefined, page, pageSize: 20 },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити відгуки.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [status, page, reloadToken])

  async function moderate(id: number, action: 'approve' | 'reject') {
    if (pendingId != null) return
    setPendingId(id)
    setActionError(null)
    try {
      if (action === 'approve') await adminApi.approveReview(id)
      else await adminApi.rejectReview(id)
      setReloadToken((value) => value + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Не вдалося оновити статус.'))
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete() {
    if (deleteId == null || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await adminApi.deleteReview(deleteId)
      setDeleteId(null)
      setReloadToken((value) => value + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити відгук.'))
    } finally {
      setDeleting(false)
    }
  }

  const items = result?.items ?? []

  return (
    <PageContainer
      title="Адмін · Відгуки"
      description="Список фільтрується за статусом (за замовчуванням Pending). Approve / reject / delete через /api/admin/reviews."
    >
      <div className={styles.toolbar}>
        <Select
          label="Статус"
          value={status}
          options={REVIEW_STATUSES.map((item) => ({ value: item, label: item }))}
          onChange={(event) => {
            setPage(1)
            setStatus(event.target.value)
          }}
        />
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      {deleteId != null ? (
        <div className={styles.confirm}>
          <ConfirmDeletePanel
            title="Видалити відгук?"
            message="Відгук буде видалено остаточно."
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
        <EmptyState title="Немає відгуків" message="Змініть фільтр статусу." />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {items.map((review) => (
              <li key={review.id} className={styles.item}>
                <div className={styles.body}>
                  <p className={styles.meta}>
                    #{review.id} · {review.status} · ★ {review.rating}
                  </p>
                  <p className={styles.title}>
                    {review.perfume.name}{' '}
                    <ButtonLink
                      to={perfumeDetailsPath(review.perfume.id)}
                      size="sm"
                      variant="ghost"
                    >
                      Відкрити
                    </ButtonLink>
                  </p>
                  <p className={styles.user}>
                    {review.user.username} · {review.user.email}
                  </p>
                  {review.text ? <p className={styles.text}>{review.text}</p> : null}
                </div>
                <div className={styles.actions}>
                  {review.status !== 'Approved' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="accent"
                      loading={pendingId === review.id}
                      disabled={pendingId != null}
                      onClick={() => void moderate(review.id, 'approve')}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {review.status !== 'Rejected' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      loading={pendingId === review.id}
                      disabled={pendingId != null}
                      onClick={() => void moderate(review.id, 'reject')}
                    >
                      Reject
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pendingId != null}
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
