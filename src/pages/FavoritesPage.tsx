import { useEffect, useMemo, useState } from 'react'
import type { Perfume } from '@/entities/perfume'
import { PerfumeCard } from '@/features/catalog/ui/PerfumeCard'
import layoutStyles from '@/features/catalog/ui/CatalogPageView.module.css'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { favoritesApi, useFavorites } from '@/features/favorites'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './FavoritesPage.module.css'

const PAGE_SIZE = 20

export function FavoritesPage() {
  const { favoriteIds, error: syncError } = useFavorites()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<Perfume> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await favoritesApi.getList(
          { page, pageSize: PAGE_SIZE },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити обране.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  const visibleItems = useMemo(() => {
    if (!result) return []
    return result.items.filter((perfume) => favoriteIds.has(perfume.id))
  }, [result, favoriteIds])

  const showEmpty =
    !loading &&
    !error &&
    result !== null &&
    result.totalItems === 0

  const showPageCleared =
    !loading &&
    !error &&
    result !== null &&
    result.totalItems > 0 &&
    visibleItems.length === 0

  return (
    <PageContainer
      title="Обране"
      description="Збережені парфуми — додавайте з каталогу або сторінки деталей."
    >
      {syncError ? <p className={styles.syncError}>{syncError}</p> : null}

      {loading ? <LoadingState label="Завантаження обраного…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка завантаження"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {showEmpty ? (
        <EmptyState
          title="Список обраного порожній"
          message="Додайте парфуми з каталогу, щоб швидко повертатися до них тут."
          action={<ButtonLink to={ROUTES.catalog}>До каталогу</ButtonLink>}
        />
      ) : null}

      {showPageCleared ? (
        <EmptyState
          title="На цій сторінці більше немає обраного"
          message="Оновіть список або перейдіть на іншу сторінку."
          action={
            <Button
              type="button"
              onClick={() => {
                setPage(1)
                setReloadToken((value) => value + 1)
              }}
            >
              Оновити
            </Button>
          }
        />
      ) : null}

      {!loading && !error && visibleItems.length > 0 ? (
        <>
          <p className={styles.meta}>
            {result?.totalItems ?? visibleItems.length}{' '}
            {(result?.totalItems ?? visibleItems.length) === 1
              ? 'парфум'
              : 'парфумів'}
          </p>
          <div className={layoutStyles.grid}>
            {visibleItems.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} />
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
    </PageContainer>
  )
}
