import { useEffect, useState } from 'react'
import {
  recommendationHistoryApi,
  type RecommendationHistoryDetails,
  type RecommendationHistorySummary,
} from '@/features/recommendations'
import { RecommendationList } from '@/features/recommendations/ui/RecommendationList'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import styles from './RecommendationHistoryPanel.module.css'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function RecommendationHistoryPanel() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<RecommendationHistorySummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [details, setDetails] = useState<RecommendationHistoryDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await recommendationHistoryApi.getBatches(
          { page, pageSize: 10 },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити історію рекомендацій.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  async function openBatch(batchId: string) {
    setDetailsLoading(true)
    setDetailsError(null)
    try {
      const response = await recommendationHistoryApi.getBatch(batchId)
      setDetails(response)
    } catch (err) {
      setDetails(null)
      setDetailsError(getApiErrorMessage(err, 'Не вдалося відкрити batch.'))
    } finally {
      setDetailsLoading(false)
    }
  }

  const items = result?.items ?? []

  return (
    <div>
      {loading ? <LoadingState label="Завантаження batch-ів…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Немає збережених рекомендацій"
          message="Натисніть «Оновити рекомендації» — batch з’явиться тут."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((batch) => (
            <li key={batch.batchId} className={styles.item}>
              <p className={styles.date}>{formatDate(batch.createdAt)}</p>
              <p className={styles.meta}>
                {batch.itemCount} позицій
                {batch.topScore != null ? ` · top score ${batch.topScore}` : ''}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void openBatch(batch.batchId)}
              >
                Показати
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {result && result.totalPages > 1 ? (
        <CatalogPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
      ) : null}

      {detailsLoading ? <LoadingState label="Завантаження деталей…" /> : null}
      {detailsError ? (
        <p className={styles.error} role="alert">
          {detailsError}
        </p>
      ) : null}
      {details ? (
        <div className={styles.details}>
          <h3 className={styles.detailsTitle}>Batch {formatDate(details.createdAt)}</h3>
          <RecommendationList items={details.items} />
        </div>
      ) : null}
    </div>
  )
}
