import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { MatchingResult } from '@/features/matching/model/types'
import { ScoreBreakdownPanel } from '@/shared/scoring'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { EmptyState } from '@/shared/ui/EmptyState'
import styles from './MatchingResults.module.css'

type MatchingResultsProps = {
  items: MatchingResult[]
  submitted: boolean
  /** When set, only the first N items are rendered. */
  limit?: number
  /** Optional footer under the list (e.g. “Дивитись ще”). */
  footer?: ReactNode
  emptyTitle?: string
  emptyMessage?: string
  idleTitle?: string
  idleMessage?: string
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

function normalizeBreakdown(item: MatchingResult) {
  return {
    components: item.components ?? [],
    positiveReasons: item.positiveReasons ?? [],
    mismatchReasons: item.mismatchReasons ?? [],
    dataGaps: item.dataGaps ?? [],
  }
}

export function MatchingResults({
  items,
  submitted,
  limit,
  footer,
  emptyTitle = 'Нічого не знайдено',
  emptyMessage = 'Спробуйте змінити критерії підбору та надіслати запит знову.',
  idleTitle = 'Результати з’являться тут',
  idleMessage = 'Оберіть критерії та натисніть «Підібрати парфуми».',
}: MatchingResultsProps) {
  if (!submitted) {
    return <EmptyState title={idleTitle} message={idleMessage} />
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />
  }

  const visible =
    typeof limit === 'number' && limit > 0 ? items.slice(0, limit) : items
  const isPreview = visible.length < items.length
  const titleCount = isPreview
    ? `${visible.length} з ${items.length}`
    : String(items.length)

  return (
    <section className={styles.root} aria-labelledby="matching-results-title">
      <h2 id="matching-results-title" className={styles.title}>
        Результати · {titleCount}
      </h2>

      <ol className={styles.list}>
        {visible.map((item, index) => {
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
                  breakdown={normalizeBreakdown(item)}
                  reasons={item.reasons ?? []}
                />
              </div>
            </li>
          )
        })}
      </ol>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  )
}
