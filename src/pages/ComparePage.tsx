import { useEffect, useState } from 'react'
import {
  COMPARE_MAX_ITEMS,
  COMPARE_MIN_ITEMS,
  comparisonApi,
  useComparison,
  type ComparisonResponse,
} from '@/features/comparison'
import { ComparisonAnalysisPanel } from '@/features/comparison/ui/ComparisonAnalysisPanel'
import { ComparisonSelectionList } from '@/features/comparison/ui/ComparisonSelectionList'
import { ComparisonTable } from '@/features/comparison/ui/ComparisonTable'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './ComparePage.module.css'

export function ComparePage() {
  const { items, count, remove, clear } = useComparison()
  const idsKey = items.map((item) => item.id).join(',')

  const [result, setResult] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const canCompare = count >= COMPARE_MIN_ITEMS && count <= COMPARE_MAX_ITEMS

  useEffect(() => {
    if (!canCompare) return

    const controller = new AbortController()
    const ids = idsKey
      .split(',')
      .map((part) => Number.parseInt(part, 10))
      .filter((id) => Number.isFinite(id) && id > 0)

    async function loadComparison() {
      setLoading(true)
      setError(null)
      try {
        const response = await comparisonApi.compare(
          { perfumeIds: ids },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося виконати порівняння.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadComparison()
    return () => controller.abort()
  }, [canCompare, idsKey, reloadToken])

  function handleRemove(perfumeId: number) {
    remove(perfumeId)
  }

  function handleClear() {
    clear()
    setResult(null)
    setError(null)
  }

  return (
    <PageContainer
      title="Порівняння"
      description={`Оберіть від ${COMPARE_MIN_ITEMS} до ${COMPARE_MAX_ITEMS} парфумів у каталозі або на картці.`}
    >
      <div className={styles.stack}>
        <ComparisonSelectionList onClear={handleClear} />

        {count === 0 ? (
          <EmptyState
            title="Немає парфумів для порівняння"
            message="Додайте парфуми з каталогу або зі сторінки деталей."
            action={<ButtonLink to={ROUTES.catalog}>До каталогу</ButtonLink>}
          />
        ) : null}

        {count > 0 && count < COMPARE_MIN_ITEMS ? (
          <EmptyState
            title="Потрібно ще хоча б один парфум"
            message={`Зараз обрано ${count}. Мінімум для порівняння — ${COMPARE_MIN_ITEMS}.`}
            action={<ButtonLink to={ROUTES.catalog}>Обрати в каталозі</ButtonLink>}
          />
        ) : null}

        {canCompare && loading ? (
          <LoadingState label="Порівнюємо парфуми…" />
        ) : null}

        {canCompare && !loading && error ? (
          <ErrorState
            title="Помилка порівняння"
            message={error}
            onRetry={() => setReloadToken((value) => value + 1)}
            action={
              <Button type="button" variant="ghost" onClick={handleClear}>
                Очистити вибір
              </Button>
            }
          />
        ) : null}

        {canCompare && !loading && !error && result ? (
          <>
            <ComparisonTable
              items={result.items}
              analysis={result.analysis}
              onRemove={handleRemove}
            />
            <ComparisonAnalysisPanel analysis={result.analysis} />
            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={handleClear}>
                Очистити порівняння
              </Button>
              <ButtonLink to={ROUTES.catalog} variant="accent">
                Додати ще з каталогу
              </ButtonLink>
            </div>
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
