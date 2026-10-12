import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { similarPerfumesApi } from '@/features/similar-perfumes/api/similarPerfumesApi'
import type { SimilarPerfumesPage } from '@/features/similar-perfumes/model/types'
import { ScoreBreakdownPanel } from '@/shared/scoring'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import styles from './SimilarPerfumesPanel.module.css'

type SimilarPerfumesPanelProps = {
  perfumeId: number
}

function formatScore(score: number): string {
  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 2,
  }).format(score)
}

function formatPrice(
  price: number | null,
  currency: string | null,
): string | null {
  if (price === null || price === undefined) return null
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: currency && currency.length === 3 ? currency : 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

export function SimilarPerfumesPanel({ perfumeId }: SimilarPerfumesPanelProps) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<SimilarPerfumesPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await similarPerfumesApi.getSimilar(
          perfumeId,
          { page, pageSize: 10 },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setData(result)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setData(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити схожі аромати.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [perfumeId, page, reload])

  return (
    <section className={styles.root} aria-labelledby="similar-perfumes-title">
      <div className={styles.header}>
        <h2 id="similar-perfumes-title" className={styles.title}>
          Схожі аромати
        </h2>
        {data && data.totalItems > 0 ? (
          <p className={styles.count}>
            Знайдено {data.totalItems}
          </p>
        ) : null}
      </div>

      {loading ? <LoadingState label="Шукаємо схожі аромати…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && data && data.items.length === 0 ? (
        <EmptyState
          title="Схожих ароматів не знайдено"
          message="У каталозі поки немає достатньо близьких збігів за нотами та характеристиками."
        />
      ) : null}

      {!loading && !error && data && data.items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {data.items.map((item) => {
              const priceLabel = formatPrice(
                item.perfume.price,
                item.perfume.currency,
              )
              return (
                <li key={item.perfume.id} className={styles.item}>
                  <div className={styles.row}>
                    <div className={styles.meta}>
                      <p className={styles.brand}>{item.perfume.brandName}</p>
                      <Link
                        to={perfumeDetailsPath(item.perfume.id)}
                        className={styles.name}
                      >
                        {item.perfume.name}
                      </Link>
                      {item.perfume.fragranceTypeName ? (
                        <p className={styles.type}>
                          {item.perfume.fragranceTypeName}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.scoreBlock}>
                      <span className={styles.scoreLabel}>Схожість</span>
                      <span className={styles.score}>
                        {formatScore(item.totalScore)}
                      </span>
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
                  />
                </li>
              )
            })}
          </ul>

          {data.totalPages > 1 ? (
            <div className={styles.pagination}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Назад
              </Button>
              <span className={styles.pageLabel}>
                Сторінка {data.page} з {data.totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page >= data.totalPages || loading}
                onClick={() =>
                  setPage((value) => Math.min(data.totalPages, value + 1))
                }
              >
                Далі
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
