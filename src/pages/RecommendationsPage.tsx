import { useEffect, useState } from 'react'
import {
  recommendationsApi,
  type RecommendationsResponse,
} from '@/features/recommendations'
import { RecommendationHistoryPanel } from '@/features/recommendations/ui/RecommendationHistoryPanel'
import { RecommendationList } from '@/features/recommendations/ui/RecommendationList'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './RecommendationsPage.module.css'

export function RecommendationsPage() {
  const [data, setData] = useState<RecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await recommendationsApi.get(controller.signal)
        if (!controller.signal.aborted) {
          setData(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setData(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити рекомендації.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadToken])

  async function handleRefresh() {
    if (refreshing || loading) return
    setRefreshing(true)
    setError(null)
    try {
      const response = await recommendationsApi.refresh()
      setData(response)
      setHistoryKey((value) => value + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося оновити рекомендації.'))
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <PageContainer
      title="Рекомендації"
      description="Персональний список на основі ваших уподобань, високих оцінок і обраного."
    >
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="accent"
          loading={refreshing}
          disabled={loading || refreshing}
          onClick={() => void handleRefresh()}
        >
          Оновити рекомендації
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowHistory((value) => !value)}
        >
          {showHistory ? 'Сховати історію' : 'Історія batch-ів'}
        </Button>
      </div>

      {showHistory ? (
        <div className={styles.history}>
          <RecommendationHistoryPanel key={historyKey} />
        </div>
      ) : null}

      {loading ? <LoadingState label="Завантаження рекомендацій…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка завантаження"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && data && !data.preferencesConfigured ? (
        <EmptyState
          title="Потрібні уподобання"
          message={
            data.message ??
            'Заповніть уподобання або оцініть парфуми, щоб отримати персональні рекомендації.'
          }
          action={<ButtonLink to={ROUTES.preferences}>До уподобань</ButtonLink>}
        />
      ) : null}

      {!loading &&
      !error &&
      data &&
      data.preferencesConfigured &&
      data.items.length === 0 ? (
        <EmptyState
          title="Немає рекомендацій"
          message={
            data.message ??
            'За поточними уподобаннями підходящих парфумів не знайдено.'
          }
          action={
            <Button
              type="button"
              variant="ghost"
              loading={refreshing}
              onClick={() => void handleRefresh()}
            >
              Спробувати оновити
            </Button>
          }
        />
      ) : null}

      {!loading &&
      !error &&
      data &&
      data.preferencesConfigured &&
      data.items.length > 0 ? (
        <RecommendationList items={data.items} />
      ) : null}
    </PageContainer>
  )
}
