import type { Perfume } from '@/entities/perfume'
import styles from './PerfumeDetailsView.module.css'

type PerfumeDetailsViewProps = {
  perfume: Perfume
  onReviewsClick?: () => void
}

function formatPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

const CHARACTERISTIC_LABELS: Array<{
  key: keyof Perfume['characteristics']
  label: string
}> = [
  { key: 'sweetness', label: 'Солодкість' },
  { key: 'freshness', label: 'Свіжість' },
  { key: 'woody', label: 'Деревність' },
  { key: 'spicy', label: 'Пряність' },
  { key: 'citrus', label: 'Цитрус' },
  { key: 'floral', label: 'Квітковість' },
  { key: 'fruity', label: 'Фруктовість' },
  { key: 'powdery', label: 'Пудра' },
  { key: 'smoky', label: 'Димність' },
  { key: 'oriental', label: 'Орієнтал' },
]

export function PerfumeDetailsView({
  perfume,
  onReviewsClick,
}: PerfumeDetailsViewProps) {
  const priceLabel = formatPrice(perfume.price)
  const notesByType = perfume.notes.reduce<Record<string, string[]>>((acc, note) => {
    const key = note.noteType || 'Other'
    acc[key] = acc[key] ?? []
    acc[key].push(note.name)
    return acc
  }, {})

  return (
    <article className={styles.root}>
      <div className={styles.media}>
        {perfume.imageUrl ? (
          <img src={perfume.imageUrl} alt={perfume.name} className={styles.image} />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span>{perfume.brand.name}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <p className={styles.brand}>{perfume.brand.name}</p>
        <p className={styles.title}>{perfume.name}</p>

        <div className={styles.stats}>
          {perfume.reviewsCount > 0 && onReviewsClick ? (
            <button
              type="button"
              className={styles.ratingButton}
              onClick={onReviewsClick}
              aria-label={`Перейти до відгуків · рейтинг ${perfume.rating.toFixed(1)}, ${perfume.reviewsCount} відгуків`}
            >
              ★ {perfume.rating.toFixed(1)}
              <span className={styles.reviews}>
                ({perfume.reviewsCount} відгуків)
              </span>
            </button>
          ) : perfume.reviewsCount > 0 ? (
            <span className={styles.rating}>
              ★ {perfume.rating.toFixed(1)}
              <span className={styles.reviews}>
                ({perfume.reviewsCount} відгуків)
              </span>
            </span>
          ) : (
            <span className={styles.reviews}>Немає відгуків</span>
          )}
          {priceLabel ? <span className={styles.price}>{priceLabel}</span> : null}
        </div>

        <dl className={styles.metaList}>
          <div>
            <dt>Тип</dt>
            <dd>{perfume.fragranceType.name}</dd>
          </div>
          {perfume.releaseYear != null ? (
            <div>
              <dt>Рік</dt>
              <dd>{perfume.releaseYear}</dd>
            </div>
          ) : null}
          {perfume.concentration ? (
            <div>
              <dt>Концентрація</dt>
              <dd>{perfume.concentration}</dd>
            </div>
          ) : null}
          {perfume.gender ? (
            <div>
              <dt>Gender</dt>
              <dd>{perfume.gender}</dd>
            </div>
          ) : null}
        </dl>

        {perfume.description ? (
          <p className={styles.description}>{perfume.description}</p>
        ) : null}

        {perfume.shopLinks?.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Де купити</h2>
            <ul className={styles.shopList}>
              {perfume.shopLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shopLink}
                  >
                    {link.storeName}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {perfume.seasons.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Сезони</h2>
            <ul className={styles.chipList}>
              {perfume.seasons.map((season) => (
                <li key={season.seasonId} className={styles.chip}>
                  {season.name}
                  {season.suitability != null ? ` · ${season.suitability}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {Object.keys(notesByType).length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ноти</h2>
            <div className={styles.notesGrid}>
              {Object.entries(notesByType).map(([type, names]) => (
                <div key={type}>
                  <h3 className={styles.noteType}>{type}</h3>
                  <p className={styles.noteNames}>{names.join(', ')}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ароматичні шкали</h2>
          <ul className={styles.scaleList}>
            {CHARACTERISTIC_LABELS.map(({ key, label }) => {
              const value = perfume.characteristics[key]
              if (value == null) return null
              return (
                <li key={key} className={styles.scaleItem}>
                  <div className={styles.scaleHeader}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className={styles.scaleTrack} aria-hidden="true">
                    <div
                      className={styles.scaleFill}
                      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </article>
  )
}
