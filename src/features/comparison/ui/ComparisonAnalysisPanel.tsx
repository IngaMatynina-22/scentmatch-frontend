import type { NamedEntity } from '@/entities/perfume'
import type { ComparisonAnalysis } from '@/features/comparison/model/types'
import styles from './ComparisonAnalysisPanel.module.css'

type ComparisonAnalysisPanelProps = {
  analysis: ComparisonAnalysis
}

type ScalarItem = {
  key: string
  label: string
  isCommon: boolean
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

function AttributeList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className={styles.empty}>Немає атрибутів у цій групі</p>
  }

  return (
    <ul className={styles.summary}>
      {items.map((label) => (
        <li key={label} className={styles.summaryItem}>
          <span>{label}</span>
        </li>
      ))}
    </ul>
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

function collectScalars(analysis: ComparisonAnalysis): ScalarItem[] {
  return [
    { key: 'brand', label: 'Бренд', isCommon: analysis.brand.isCommon },
    { key: 'type', label: 'Тип', isCommon: analysis.fragranceType.isCommon },
    {
      key: 'concentration',
      label: 'Концентрація',
      isCommon: analysis.concentration.isCommon,
    },
    { key: 'gender', label: 'Gender', isCommon: analysis.gender.isCommon },
    { key: 'year', label: 'Рік', isCommon: analysis.releaseYear.isCommon },
    { key: 'price', label: 'Ціна', isCommon: analysis.price.isCommon },
    { key: 'rating', label: 'Рейтинг', isCommon: analysis.rating.isCommon },
  ]
}

function AnalysisGroup({
  title,
  headingId,
  scalars,
  notes,
  notesTitle,
  notesEmpty,
  seasons,
  seasonsTitle,
  seasonsEmpty,
  scales,
  scalesEmpty,
}: {
  title: string
  headingId: string
  scalars: string[]
  notes: NamedEntity[]
  notesTitle: string
  notesEmpty: string
  seasons: NamedEntity[]
  seasonsTitle: string
  seasonsEmpty: string
  scales: string[]
  scalesEmpty: string
}) {
  const hasContent =
    scalars.length > 0 ||
    notes.length > 0 ||
    seasons.length > 0 ||
    scales.length > 0

  return (
    <div className={styles.group} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.groupTitle}>
        {title}
      </h3>

      {!hasContent ? (
        <p className={styles.empty}>Немає пунктів у цій групі</p>
      ) : (
        <>
          <div className={styles.block}>
            <h4 className={styles.subtitle}>Атрибути</h4>
            <AttributeList items={scalars} />
          </div>

          <div className={styles.groupGrid}>
            <ChipList title={notesTitle} items={notes} emptyLabel={notesEmpty} />
            <ChipList
              title={seasonsTitle}
              items={seasons}
              emptyLabel={seasonsEmpty}
            />
          </div>

          <div className={styles.block}>
            <h4 className={styles.subtitle}>Ароматичні шкали</h4>
            {scales.length === 0 ? (
              <p className={styles.empty}>{scalesEmpty}</p>
            ) : (
              <AttributeList items={scales} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function ComparisonAnalysisPanel({ analysis }: ComparisonAnalysisPanelProps) {
  const scalars = collectScalars(analysis)
  const commonScalars = scalars.filter((item) => item.isCommon).map((item) => item.label)
  const differentScalars = scalars
    .filter((item) => !item.isCommon)
    .map((item) => item.label)

  const commonScales = analysis.characteristics
    .filter((field) => field.isCommon)
    .map((field) => CHARACTERISTIC_LABELS[field.name] ?? field.name)
  const differentScales = analysis.characteristics
    .filter((field) => !field.isCommon)
    .map((field) => CHARACTERISTIC_LABELS[field.name] ?? field.name)

  return (
    <section className={styles.root} aria-labelledby="comparison-analysis-title">
      <h2 id="comparison-analysis-title" className={styles.title}>
        Спільне та відмінності
      </h2>

      <div className={styles.sections}>
        <AnalysisGroup
          title="Спільне"
          headingId="comparison-common-title"
          scalars={commonScalars}
          notes={analysis.commonNotes}
          notesTitle="Ноти"
          notesEmpty="Немає спільних нот"
          seasons={analysis.commonSeasons}
          seasonsTitle="Сезони"
          seasonsEmpty="Немає спільних сезонів"
          scales={commonScales}
          scalesEmpty="Немає спільних шкал"
        />

        <AnalysisGroup
          title="Різне"
          headingId="comparison-different-title"
          scalars={differentScalars}
          notes={analysis.differingNotes}
          notesTitle="Ноти"
          notesEmpty="Немає відмінних нот"
          seasons={analysis.differingSeasons}
          seasonsTitle="Сезони"
          seasonsEmpty="Немає відмінних сезонів"
          scales={differentScales}
          scalesEmpty="Немає відмінних шкал"
        />
      </div>
    </section>
  )
}
