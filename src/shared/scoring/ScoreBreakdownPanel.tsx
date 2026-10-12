import type { ScoreBreakdown } from '@/shared/scoring/types'
import styles from './ScoreBreakdownPanel.module.css'

type ScoreBreakdownPanelProps = {
  breakdown: ScoreBreakdown
  /** Legacy reasons list (shown when positiveReasons empty) */
  reasons?: string[]
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 3,
  }).format(value)
}

export function ScoreBreakdownPanel({
  breakdown,
  reasons = [],
}: ScoreBreakdownPanelProps) {
  const positives =
    breakdown.positiveReasons.length > 0 ? breakdown.positiveReasons : reasons
  const hasContent =
    positives.length > 0 ||
    breakdown.mismatchReasons.length > 0 ||
    breakdown.dataGaps.length > 0 ||
    breakdown.components.length > 0

  if (!hasContent) {
    return <p className={styles.empty}>Причини не наведені.</p>
  }

  return (
    <div className={styles.root}>
      {positives.length > 0 ? (
        <div className={styles.block}>
          <p className={styles.label}>Чому підходить</p>
          <ul className={styles.list}>
            {positives.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {breakdown.mismatchReasons.length > 0 ? (
        <div className={styles.block}>
          <p className={styles.label}>Невідповідності</p>
          <ul className={`${styles.list} ${styles.mismatch}`}>
            {breakdown.mismatchReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {breakdown.dataGaps.length > 0 ? (
        <div className={styles.block}>
          <p className={styles.label}>Неповні дані</p>
          <ul className={`${styles.list} ${styles.gaps}`}>
            {breakdown.dataGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {breakdown.components.length > 0 ? (
        <div className={styles.block}>
          <p className={styles.label}>Складові оцінки</p>
          <ul className={styles.components}>
            {breakdown.components.map((component) => (
              <li key={component.key} className={styles.component}>
                <span className={styles.componentKey}>{component.key}</span>
                <span className={styles.componentMeta}>
                  {component.skippedDueToMissingData
                    ? 'пропущено (немає даних)'
                    : `схожість ${formatNumber(component.similarity)} · внесок ${formatNumber(component.contribution)} · вага ${formatNumber(component.weight)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
