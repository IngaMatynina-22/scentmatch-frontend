import { useEffect, useState } from 'react'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { AdminAuditLog } from '@/features/admin/model/platformTypes'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [result, setResult] = useState<PagedResult<AdminAuditLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await adminPlatformApi.getAuditLogs(
          {
            page,
            pageSize: 20,
            action: action || undefined,
            entityType: entityType || undefined,
          },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити audit log.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, action, entityType, reload])

  return (
    <PageContainer
      title="Audit log"
      description="Журнал адміністративних дій без секретів."
    >
      <div className={styles.filters}>
        <Input
          label="Action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
        />
        <Input
          label="Entity type"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {loading ? <LoadingState label="Завантаження…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState title="Записів немає" message="Журнал порожній." />
      ) : null}
      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Адмін</th>
                <th>Дія</th>
                <th>Сутність</th>
                <th>Результат</th>
                <th>Деталі</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString('uk-UA')}</td>
                  <td>{log.adminUserName ?? log.adminUserId}</td>
                  <td>{log.action}</td>
                  <td>
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId}` : ''}
                  </td>
                  <td>{log.result}</td>
                  <td>{log.details ?? '—'}</td>
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
