import { Link } from 'react-router-dom'
import type { Recommendation } from '@/features/recommendations/model/types'
import { ScoreBreakdownPanel } from '@/shared/scoring'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import styles from './RecommendationList.module.css'

type RecommendationListProps = {
  items: Recommendation[]
}

function formatPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

function formatScore(score: number): string {
  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 2,
  }).format(score)
}

export function RecommendationList({ items }: RecommendationListProps) {
  return (
    <section className={styles.root} aria-labelledby="recommendations-list-title">
      <h2 id="recommendations-list-title" className={styles.title}>
        Рекомендації · {items.length}
      </h2>

      <ol className={styles.list}>
        {items.map((item, index) => {
          const priceLabel = formatPrice(item.price)
          return (
            <li key={item.perfumeId} className={styles.item}>
              <div className={styles.rank} aria-hidden="true">
                {index + 1}
              </div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <div className={styles.meta}>
                    <p className={styles.brand}>{item.brandName}</p>
                    <Link
                      to={perfumeDetailsPath(item.perfumeId)}
                      className={styles.name}
                    >
                      {item.name}
                    </Link>
                  </div>
                  <div className={styles.scoreBlock}>
                    <span className={styles.scoreLabel}>Score</span>
                    <span className={styles.score}>{formatScore(item.score)}</span>
                    {priceLabel ? (
                      <span className={styles.price}>{priceLabel}</span>
                    ) : null}
                  </div>
                </div>

                <ScoreBreakdownPanel
                  breakdown={{
                    components: item.components ?? [],
                    positiveReasons: item.positiveReasons ?? [],
                    mismatchReasons: item.mismatchReasons ?? [],
                    dataGaps: item.dataGaps ?? [],
                  }}
                  reasons={item.reasons ?? []}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
