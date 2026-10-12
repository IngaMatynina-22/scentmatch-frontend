import { useEffect, useState } from 'react'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { AdminDashboard } from '@/features/admin/model/platformTypes'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await adminPlatformApi.getDashboard(controller.signal)
        if (!controller.signal.aborted) setData(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити dashboard.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reload])

  return (
    <PageContainer title="Dashboard" description="Огляд каталогу та модерації.">
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.admin.catalogQuality} variant="ghost" size="sm">
          Якість
        </ButtonLink>
        <ButtonLink to={ROUTES.admin.jobs} variant="ghost" size="sm">
          Задачі
        </ButtonLink>
        <ButtonLink to={ROUTES.admin.integrations} variant="ghost" size="sm">
          Інтеграції
        </ButtonLink>
      </div>

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
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.perfumeCount}</div>
              <div className={styles.statLabel}>Парфуми</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.brandCount}</div>
              <div className={styles.statLabel}>Бренди</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.noteCount}</div>
              <div className={styles.statLabel}>Ноти</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.seasonCount}</div>
              <div className={styles.statLabel}>Сезони</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.fragranceTypeCount}</div>
              <div className={styles.statLabel}>Типи</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{data.recentJobErrorCount}</div>
              <div className={styles.statLabel}>Помилки задач</div>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Відгуки</h2>
              <p className={styles.meta}>
                Очікують: {data.reviewsByStatus.pending}
              </p>
              <p className={styles.meta}>
                Схвалено: {data.reviewsByStatus.approved}
              </p>
              <p className={styles.meta}>
                Відхилено: {data.reviewsByStatus.rejected}
              </p>
            </section>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Пробіли каталогу</h2>
              <p className={styles.meta}>
                Без нот: {data.catalogGaps.missingNotes}
              </p>
              <p className={styles.meta}>
                Без сезонів: {data.catalogGaps.missingSeasons}
              </p>
              <p className={styles.meta}>
                Без зображення: {data.catalogGaps.missingImage}
              </p>
              <p className={styles.meta}>
                Без ціни: {data.catalogGaps.missingPrice}
              </p>
            </section>
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
