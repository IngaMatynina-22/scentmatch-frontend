import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  Brand,
  FragranceType,
  Note,
  Perfume,
  PerfumeQuery,
  Season,
} from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import {
  clearCatalogFilters,
  parseCatalogQuery,
  serializeCatalogQuery,
} from '@/features/catalog/model/catalogQuery'
import { CatalogFilters } from '@/features/catalog/ui/CatalogFilters'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import layoutStyles from '@/features/catalog/ui/CatalogPageView.module.css'
import { CatalogToolbar } from '@/features/catalog/ui/CatalogToolbar'
import { PerfumeCard } from '@/features/catalog/ui/PerfumeCard'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Skeleton } from '@/shared/ui/Skeleton'

type Dictionaries = {
  brands: Brand[]
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const query = useMemo(
    () => parseCatalogQuery(new URLSearchParams(searchKey)),
    [searchKey],
  )

  const [dictionaries, setDictionaries] = useState<Dictionaries>({
    brands: [],
    seasons: [],
    fragranceTypes: [],
    notes: [],
  })
  const [dictError, setDictError] = useState<string | null>(null)

  const [result, setResult] = useState<PagedResult<Perfume> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const updateQuery = useCallback(
    (patch: Partial<PerfumeQuery>, options?: { resetPage?: boolean }) => {
      const current = parseCatalogQuery(new URLSearchParams(searchKey))
      const next: PerfumeQuery = {
        ...current,
        ...patch,
        page: options?.resetPage ? 1 : (patch.page ?? current.page),
      }
      setSearchParams(serializeCatalogQuery(next), { replace: true })
    },
    [searchKey, setSearchParams],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadDictionaries() {
      setDictError(null)
      try {
        const [brands, seasons, fragranceTypes, notes] = await Promise.all([
          catalogApi.getBrands(controller.signal),
          catalogApi.getSeasons(controller.signal),
          catalogApi.getFragranceTypes(controller.signal),
          catalogApi.getNotes(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setDictionaries({ brands, seasons, fragranceTypes, notes })
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setDictError(getApiErrorMessage(err, 'Не вдалося завантажити довідники.'))
      }
    }

    void loadDictionaries()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadPerfumes() {
      setLoading(true)
      setError(null)
      try {
        const page = await catalogApi.getPerfumes(query, controller.signal)
        if (!controller.signal.aborted) {
          setResult(page)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити каталог.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadPerfumes()
    return () => controller.abort()
  }, [query, reloadToken])

  return (
    <PageContainer
      title="Каталог"
      description="Пошук і фільтрація парфумів за характеристиками з серверною пагінацією."
    >
      {dictError ? (
        <ErrorState
          title="Довідники недоступні"
          message={dictError}
          onRetry={() => window.location.reload()}
        />
      ) : null}

      <div className={layoutStyles.layout}>
        <CatalogFilters
          query={query}
          brands={dictionaries.brands}
          seasons={dictionaries.seasons}
          fragranceTypes={dictionaries.fragranceTypes}
          notes={dictionaries.notes}
          onChange={updateQuery}
          onClear={() => updateQuery(clearCatalogFilters(query), { resetPage: true })}
        />

        <div className={layoutStyles.results}>
          <CatalogToolbar
            query={query}
            totalItems={result?.totalItems ?? 0}
            onChange={updateQuery}
          />

          {loading ? (
            <div className={layoutStyles.skeletonGrid} aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height="22rem" radius="lg" />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <ErrorState
              title="Помилка завантаження"
              message={error}
              onRetry={() => setReloadToken((value) => value + 1)}
            />
          ) : null}

          {!loading && !error && result && result.items.length === 0 ? (
            <EmptyState
              title="Нічого не знайдено"
              message="Змініть пошук або фільтри й спробуйте знову."
            />
          ) : null}

          {!loading && !error && result && result.items.length > 0 ? (
            <>
              <div className={layoutStyles.grid}>
                {result.items.map((perfume) => (
                  <PerfumeCard key={perfume.id} perfume={perfume} />
                ))}
              </div>
              <CatalogPagination
                page={result.page}
                totalPages={result.totalPages}
                onPageChange={(page) => updateQuery({ page })}
              />
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
