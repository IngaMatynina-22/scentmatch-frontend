import { useEffect, useState } from 'react'
import { PerfumeCard } from '@/features/catalog/ui/PerfumeCard'
import layoutStyles from '@/features/catalog/ui/CatalogPageView.module.css'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { ConfirmDeletePanel } from '@/features/collections'
import { viewHistoryApi, type ViewHistoryItem } from '@/features/view-history'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import styles from './ViewHistoryPanel.module.css'

export function ViewHistoryPanel() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<ViewHistoryItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await viewHistoryApi.getList(
          { page, pageSize: 12 },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити історію переглядів.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  async function handleClear() {
    if (clearing) return
    setClearing(true)
    setClearError(null)
    try {
      await viewHistoryApi.clear()
      setConfirmClear(false)
      setPage(1)
      setReloadToken((value) => value + 1)
    } catch (err) {
      setClearError(getApiErrorMessage(err, 'Не вдалося очистити.'))
    } finally {
      setClearing(false)
    }
  }

  const items = result?.items ?? []

  return (
    <div>
      {items.length > 0 && !confirmClear ? (
        <div className={styles.toolbar}>
          <Button type="button" variant="ghost" onClick={() => setConfirmClear(true)}>
            Очистити перегляди
          </Button>
        </div>
      ) : null}
      {confirmClear ? (
        <div className={styles.confirm}>
          <ConfirmDeletePanel
            title="Очистити історію переглядів?"
            message="Усі записи переглядів буде видалено."
            confirming={clearing}
            error={clearError}
            onConfirm={() => void handleClear()}
            onCancel={() => setConfirmClear(false)}
          />
        </div>
      ) : null}
      {loading ? <LoadingState label="Завантаження переглядів…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Переглядів ще немає"
          message="Відкрийте картку парфуму — перегляд збережеться автоматично."
        />
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className={layoutStyles.grid}>
            {items.map((item) => (
              <PerfumeCard key={item.id} perfume={item.perfume} />
            ))}
          </div>
          {result && result.totalPages > 1 ? (
            <CatalogPagination
              page={result.page}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
