import { Link, useLocation } from 'react-router-dom'
import type { Perfume } from '@/entities/perfume'
import { AddToCollectionButton } from '@/features/collections'
import { CompareToggleButton } from '@/features/comparison/ui/CompareToggleButton'
import { FavoriteToggleButton } from '@/features/favorites'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import styles from './PerfumeCard.module.css'

type PerfumeCardProps = {
  perfume: Perfume
}

function formatPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const location = useLocation()
  const priceLabel = formatPrice(perfume.price)
  const seasons = perfume.seasons.map((item) => item.name).filter(Boolean)
  const topNotes = perfume.notes.slice(0, 3).map((item) => item.name)

  return (
    <article className={styles.card}>
      <Link
        to={perfumeDetailsPath(perfume.id)}
        state={{ catalogSearch: location.search }}
        className={styles.link}
      >
        <div className={styles.media} aria-hidden={perfume.imageUrl ? undefined : true}>
          {perfume.imageUrl ? (
            <img src={perfume.imageUrl} alt="" className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.fallback}>
              <span className={styles.fallbackLabel}>{perfume.brand.name}</span>
            </div>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.brand}>{perfume.brand.name}</p>
          <h2 className={styles.title}>{perfume.name}</h2>
          <p className={styles.meta}>
            {perfume.fragranceType.name}
            {perfume.concentration ? ` · ${perfume.concentration}` : ''}
            {perfume.gender ? ` · ${perfume.gender}` : ''}
          </p>

          <div className={styles.stats}>
            <span
              className={styles.rating}
              aria-label={
                perfume.reviewsCount > 0
                  ? `Рейтинг ${perfume.rating.toFixed(1)}`
                  : 'Немає відгуків'
              }
            >
              {perfume.reviewsCount > 0 ? (
                <>
                  ★ {perfume.rating.toFixed(1)}
                  <span className={styles.reviews}>({perfume.reviewsCount})</span>
                </>
              ) : (
                <span className={styles.reviews}>Немає відгуків</span>
              )}
            </span>
            {priceLabel ? <span className={styles.price}>{priceLabel}</span> : null}
          </div>

          {topNotes.length > 0 ? (
            <p className={styles.notes}>{topNotes.join(' · ')}</p>
          ) : null}

          {seasons.length > 0 ? (
            <p className={styles.seasons}>{seasons.join(' · ')}</p>
          ) : null}
        </div>
      </Link>

      <div className={styles.actions}>
        <FavoriteToggleButton perfumeId={perfume.id} fullWidth />
        <AddToCollectionButton perfumeId={perfume.id} fullWidth />
        <CompareToggleButton
          perfume={{
            id: perfume.id,
            name: perfume.name,
            brandName: perfume.brand.name,
          }}
          fullWidth
        />
      </div>
    </article>
  )
}
