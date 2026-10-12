import type { NamedEntity } from '@/entities/perfume'
import type { ComparisonAnalysis } from '@/features/comparison/model/types'
import styles from './ComparisonAnalysisPanel.module.css'

type ComparisonAnalysisPanelProps = {
  analysis: ComparisonAnalysis
}

function ChipList({
  title,
  items,
  emptyLabel,
}: {
  title: string
  items: NamedEntity[]
  emptyLabel: string
}) {
  return (
    <div className={styles.block}>
      <h3 className={styles.subtitle}>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ul className={styles.chips}>
          {items.map((item) => (
            <li key={item.id} className={styles.chip}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SummaryLine({
  label,
  isCommon,
}: {
  label: string
  isCommon: boolean
}) {
  return (
    <li className={styles.summaryItem}>
      <span>{label}</span>
      <span className={isCommon ? styles.tagCommon : styles.tagDiff}>
        {isCommon ? 'спільне' : 'різне'}
      </span>
    </li>
  )
}

const CHARACTERISTIC_LABELS: Record<string, string> = {
  Sweetness: 'Солодкість',
  Freshness: 'Свіжість',
  Woody: 'Деревність',
  Spicy: 'Пряність',
  Citrus: 'Цитрус',
  Floral: 'Квітковість',
  Fruity: 'Фруктовість',
  Powdery: 'Пудра',
  Smoky: 'Димність',
  Oriental: 'Орієнтал',
}

export function ComparisonAnalysisPanel({ analysis }: ComparisonAnalysisPanelProps) {
  return (
    <section className={styles.root} aria-labelledby="comparison-analysis-title">
      <h2 id="comparison-analysis-title" className={styles.title}>
        Спільне та відмінності
      </h2>

      <ul className={styles.summary}>
        <SummaryLine label="Бренд" isCommon={analysis.brand.isCommon} />
        <SummaryLine label="Тип" isCommon={analysis.fragranceType.isCommon} />
        <SummaryLine label="Концентрація" isCommon={analysis.concentration.isCommon} />
        <SummaryLine label="Gender" isCommon={analysis.gender.isCommon} />
        <SummaryLine label="Рік" isCommon={analysis.releaseYear.isCommon} />
        <SummaryLine label="Ціна" isCommon={analysis.price.isCommon} />
        <SummaryLine label="Рейтинг" isCommon={analysis.rating.isCommon} />
      </ul>

      <div className={styles.grid}>
        <ChipList
          title="Спільні ноти"
          items={analysis.commonNotes}
          emptyLabel="Немає спільних нот"
        />
        <ChipList
          title="Відмінні ноти"
          items={analysis.differingNotes}
          emptyLabel="Немає відмінних нот"
        />
        <ChipList
          title="Спільні сезони"
          items={analysis.commonSeasons}
          emptyLabel="Немає спільних сезонів"
        />
        <ChipList
          title="Відмінні сезони"
          items={analysis.differingSeasons}
          emptyLabel="Немає відмінних сезонів"
        />
      </div>

      <div className={styles.block}>
        <h3 className={styles.subtitle}>Ароматичні шкали</h3>
        <ul className={styles.summary}>
          {analysis.characteristics.map((field) => (
            <SummaryLine
              key={field.name}
              label={CHARACTERISTIC_LABELS[field.name] ?? field.name}
              isCommon={field.isCommon}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
