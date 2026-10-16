import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import type { Perfume, Review, ReviewQuery } from '@/entities/perfume'
import { useAuth } from '@/features/auth'
import { AddToCollectionButton } from '@/features/collections'
import { CompareToggleButton } from '@/features/comparison/ui/CompareToggleButton'
import { FavoriteToggleButton } from '@/features/favorites'
import { perfumeDetailsApi } from '@/features/perfume-details/api/perfumeDetailsApi'
import { PerfumeDetailsView } from '@/features/perfume-details/ui/PerfumeDetailsView'
import { PerfumeReviewsList } from '@/features/perfume-details/ui/PerfumeReviewsList'
import { OwnReviewPanel } from '@/features/reviews'
import { SimilarPerfumesPanel } from '@/features/similar-perfumes'
import { AddToWishlistButton } from '@/features/wishlist'
import { viewHistoryApi } from '@/features/view-history'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './PerfumeDetailsPage.module.css'

type LocationState = {
  catalogSearch?: string
}

function catalogBackHref(catalogSearch: string): string {
  if (!catalogSearch) return ROUTES.catalog
  return `${ROUTES.catalog}${catalogSearch.startsWith('?') ? catalogSearch : `?${catalogSearch}`}`
}

export function PerfumeDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const perfumeId = Number.parseInt(id ?? '', 10)
  const validId = Number.isFinite(perfumeId) && perfumeId > 0
  const catalogSearch =
    (location.state as LocationState | null)?.catalogSearch ?? ''
  const backHref = catalogBackHref(catalogSearch)

  const [perfume, setPerfume] = useState<Perfume | null>(null)
  const [perfumeLoading, setPerfumeLoading] = useState(validId)
  const [perfumeError, setPerfumeError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [perfumeReload, setPerfumeReload] = useState(0)

  const [reviewQuery, setReviewQuery] = useState<ReviewQuery>({
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  })
  const [reviews, setReviews] = useState<PagedResult<Review> | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewsReload, setReviewsReload] = useState(0)

  useEffect(() => {
    if (!validId) return

    const controller = new AbortController()

    async function loadPerfume() {
      setPerfumeLoading(true)
      setPerfumeError(null)
      setNotFound(false)
      try {
        const details = await perfumeDetailsApi.getById(perfumeId, controller.signal)
        if (!controller.signal.aborted) {
          setPerfume(details)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setPerfume(null)
        if (error instanceof ApiError && error.code === 'NOT_FOUND') {
          setNotFound(true)
        } else {
          setPerfumeError(
            getApiErrorMessage(error, 'Не вдалося завантажити картку парфуму.'),
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setPerfumeLoading(false)
        }
      }
    }

    void loadPerfume()
    return () => controller.abort()
  }, [perfumeId, validId, perfumeReload])

  const perfumeLoadedId = perfume?.id

  useEffect(() => {
    if (!validId || notFound || perfumeLoadedId == null || !isAuthenticated) return
    const controller = new AbortController()
    void viewHistoryApi.register(perfumeId, controller.signal).catch(() => {
      // Non-blocking: view history must not break perfume details.
    })
    return () => controller.abort()
  }, [perfumeId, validId, notFound, perfumeLoadedId, isAuthenticated])

  useEffect(() => {
    if (!validId || notFound || perfumeLoadedId == null) return

    const controller = new AbortController()

    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const page = await perfumeDetailsApi.getApprovedReviews(
          perfumeId,
          reviewQuery,
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setReviews(page)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setReviews(null)
        setReviewsError(getApiErrorMessage(error, 'Не вдалося завантажити відгуки.'))
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false)
        }
      }
    }

    void loadReviews()
    return () => controller.abort()
  }, [perfumeId, validId, notFound, perfumeLoadedId, reviewQuery, reviewsReload])

  if (!validId || notFound) {
    return (
      <PageContainer title="Парфум не знайдено">
        <ErrorState
          title="404"
          message="Парфум із таким ідентифікатором відсутній або недоступний."
          action={<ButtonLink to={backHref}>До каталогу</ButtonLink>}
        />
      </PageContainer>
    )
  }

  if (perfumeLoading) {
    return (
      <PageContainer title="Картка парфуму">
        <LoadingState label="Завантаження парфуму…" />
      </PageContainer>
    )
  }

  if (perfumeError || !perfume) {
    return (
      <PageContainer title="Картка парфуму">
        <ErrorState
          title="Помилка завантаження"
          message={perfumeError ?? 'Невідома помилка.'}
          onRetry={() => setPerfumeReload((value) => value + 1)}
          action={<ButtonLink to={backHref}>До каталогу</ButtonLink>}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer title={perfume.name} description={perfume.brand.name}>
      <Link to={backHref} className={styles.backLink}>
        ← Назад до каталогу
      </Link>

      <div className={styles.actions}>
        <FavoriteToggleButton perfumeId={perfume.id} size="md" />
        <AddToCollectionButton perfumeId={perfume.id} size="md" />
        <CompareToggleButton
          perfume={{
            id: perfume.id,
            name: perfume.name,
            brandName: perfume.brand.name,
          }}
          size="md"
        />
        <ButtonLink to={ROUTES.compare} variant="ghost">
          Відкрити порівняння
        </ButtonLink>
        {isAuthenticated ? (
          <>
            <ButtonLink
              to={`${ROUTES.journal}?perfumeId=${perfume.id}`}
              variant="ghost"
            >
              Запис у щоденник
            </ButtonLink>
            <AddToWishlistButton perfumeId={perfume.id} size="md" />
            <ButtonLink to={ROUTES.wardrobe} variant="ghost">
              Гардероб
            </ButtonLink>
          </>
        ) : null}
      </div>

      <PerfumeDetailsView
        perfume={perfume}
        onReviewsClick={() => {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches
          document.getElementById('perfume-reviews')?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          })
        }}
      />

      <SimilarPerfumesPanel perfumeId={perfume.id} />

      <OwnReviewPanel
        perfumeId={perfume.id}
        onChanged={() => setReviewsReload((value) => value + 1)}
      />

      <PerfumeReviewsList
        result={reviews}
        loading={reviewsLoading}
        error={reviewsError}
        query={reviewQuery}
        onQueryChange={(patch) => setReviewQuery((current) => ({ ...current, ...patch }))}
        onRetry={() => setReviewsReload((value) => value + 1)}
      />
    </PageContainer>
  )
}
