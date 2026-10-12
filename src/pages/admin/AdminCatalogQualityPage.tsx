import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { CatalogQualityReport } from '@/features/admin/model/platformTypes'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Select } from '@/shared/ui/Select'
import styles from '../platform.module.css'

export function AdminCatalogQualityPage() {
  const [data, setData] = useState<CatalogQualityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [issueType, setIssueType] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await adminPlatformApi.getCatalogQuality(
          controller.signal,
        )
        if (!controller.signal.aborted) setData(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити звіт якості.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reload])

  const issueTypes = useMemo(() => {
    const set = new Set((data?.issues ?? []).map((i) => i.issueType))
    return [...set].sort()
  }, [data])

  const issues = (data?.issues ?? []).filter(
    (issue) => !issueType || issue.issueType === issueType,
  )

  return (
    <PageContainer
      title="Якість каталогу"
      description="Проблеми каталогу з backend. Автоматичне виправлення не виконується."
    >
      {loading ? <LoadingState label="Завантаження…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}

      {!loading && !error && data ? (
        <>
          <p className={styles.meta}>
            Активних парфумів: {data.totalActivePerfumes}
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.summary.missingNotes}</div>
              <div className={styles.statLabel}>Без нот</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {data.summary.missingSeasons}
              </div>
              <div className={styles.statLabel}>Без сезонів</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.summary.missingImage}</div>
              <div className={styles.statLabel}>Без фото</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {data.summary.invalidShopUrls}
              </div>
              <div className={styles.statLabel}>Погані URL</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {data.summary.suspectedDuplicates}
              </div>
              <div className={styles.statLabel}>Дублікати</div>
            </div>
          </div>

          <div className={styles.filters}>
            <Select
              label="Тип проблеми"
              value={issueType}
              options={[
                { value: '', label: 'Усі' },
                ...issueTypes.map((type) => ({ value: type, label: type })),
              ]}
              onChange={(e) => setIssueType(e.target.value)}
            />
          </div>

          {issues.length === 0 ? (
            <EmptyState title="Проблем не знайдено" message="Каталог чистий." />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Парфум</th>
                  <th>Тип</th>
                  <th>Повідомлення</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={`${issue.perfumeId}-${issue.issueType}-${issue.message}`}>
                    <td>
                      {issue.brandName} — {issue.perfumeName}
                    </td>
                    <td>{issue.issueType}</td>
                    <td>{issue.message}</td>
                    <td>
                      <Link to={`${ROUTES.admin.perfumes}?edit=${issue.perfumeId}`}>
                        Редагувати
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : null}
    </PageContainer>
  )
}
