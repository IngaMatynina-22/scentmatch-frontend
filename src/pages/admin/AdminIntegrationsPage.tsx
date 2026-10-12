import { useEffect, useState } from 'react'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { AdminIntegrations } from '@/features/admin/model/platformTypes'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

export function AdminIntegrationsPage() {
  const [data, setData] = useState<AdminIntegrations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await adminPlatformApi.getIntegrations(
          controller.signal,
        )
        if (!controller.signal.aborted) setData(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(
          getApiErrorMessage(err, 'Не вдалося завантажити інтеграції.'),
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reload])

  const tracking = data?.priceTracking

  return (
    <PageContainer
      title="Інтеграції"
      description="Статус конфігурації без відображення секретів."
    >
      {loading ? <LoadingState label="Завантаження…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}

      {!loading && !error && tracking ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Відстеження цін</h2>
          <p className={styles.meta}>
            Увімкнено: {tracking.enabled ? 'так' : 'ні'}
          </p>
          <p className={styles.meta}>
            Провайдер: {tracking.providerName || '—'}
          </p>
          <p className={styles.meta}>
            Налаштовано:{' '}
            {tracking.providerConfigured ? (
              <span className={styles.success}>так</span>
            ) : (
              <span className={styles.error}>ні (stub / не налаштовано)</span>
            )}
          </p>
          <p className={styles.meta}>
            Інтервал перевірки: {tracking.checkIntervalMinutes} хв
          </p>
          <p className={styles.meta}>
            Останній успіх:{' '}
            {tracking.lastSuccessAt
              ? new Date(tracking.lastSuccessAt).toLocaleString('uk-UA')
              : 'немає'}
            {tracking.lastSuccessMessage
              ? ` — ${tracking.lastSuccessMessage}`
              : ''}
          </p>
          <p className={styles.meta}>
            Остання помилка:{' '}
            {tracking.lastErrorAt
              ? new Date(tracking.lastErrorAt).toLocaleString('uk-UA')
              : 'немає'}
            {tracking.lastErrorMessage ? ` — ${tracking.lastErrorMessage}` : ''}
          </p>
          {!tracking.providerConfigured ? (
            <p className={styles.notice}>
              Автоматичні перевірки цін недоступні, доки провайдер не
              налаштований на сервері.
            </p>
          ) : null}
        </section>
      ) : null}
    </PageContainer>
  )
}
