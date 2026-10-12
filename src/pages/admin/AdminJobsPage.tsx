import { useEffect, useState } from 'react'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { BackgroundJobLog } from '@/features/admin/model/platformTypes'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

export function AdminJobsPage() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<BackgroundJobLog> | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await adminPlatformApi.getJobs(
          { page, pageSize: 20 },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити задачі.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, reload])

  return (
    <PageContainer
      title="Фонові задачі"
      description="Статус останніх запусків. Ручний повтор не додано — endpoint відсутній."
    >
      {loading ? <LoadingState label="Завантаження…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState title="Немає логів" message="Записи задач відсутні." />
      ) : null}
      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Задача</th>
                <th>Статус</th>
                <th>Старт</th>
                <th>Кінець</th>
                <th>Оброблено</th>
                <th>Помилки</th>
                <th>Повідомлення</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((job) => (
                <tr key={job.id}>
                  <td>{job.jobName}</td>
                  <td>{job.status}</td>
                  <td>{new Date(job.startedAt).toLocaleString('uk-UA')}</td>
                  <td>
                    {job.finishedAt
                      ? new Date(job.finishedAt).toLocaleString('uk-UA')
                      : '—'}
                  </td>
                  <td>{job.processedCount}</td>
                  <td>{job.errorCount}</td>
                  <td>{job.message ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CatalogPagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
