import type { FragranceType, Note, Season } from '@/entities/perfume'
import {
  HISTORY_SCALE_FIELDS,
  getHistoryScaleValue,
  type SelectionHistoryEntry,
} from '@/features/history/model/types'
import styles from './SelectionHistoryParams.module.css'

type SelectionHistoryParamsProps = {
  entry: SelectionHistoryEntry
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
}

function formatPrice(value: number | null): string | null {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function SelectionHistoryParams({
  entry,
  seasons,
  fragranceTypes,
  notes,
}: SelectionHistoryParamsProps) {
  const seasonName =
    entry.seasonId == null
      ? null
      : (seasons.find((item) => item.id === entry.seasonId)?.name ?? `#${entry.seasonId}`)
  const typeName =
    entry.fragranceTypeId == null
      ? null
      : (fragranceTypes.find((item) => item.id === entry.fragranceTypeId)?.name ??
        `#${entry.fragranceTypeId}`)

  const noteNames = entry.selectedNoteIds.map((noteId) => {
    const note = notes.find((item) => item.id === noteId)
    return note?.name ?? `#${noteId}`
  })

  const scales = HISTORY_SCALE_FIELDS.flatMap(({ key, label }) => {
    const value = getHistoryScaleValue(entry, key)
    if (value === null || value === undefined) return []
    return [{ label, value }]
  })

  const minPrice = formatPrice(entry.minPrice)
  const maxPrice = formatPrice(entry.maxPrice)
  const priceLabel =
    minPrice || maxPrice
      ? [minPrice ?? '…', maxPrice ?? '…'].join(' — ')
      : null

  const hasAny =
    seasonName || typeName || noteNames.length > 0 || scales.length > 0 || priceLabel

  if (!hasAny) {
    return <p className={styles.empty}>Параметри підбору не збережені.</p>
  }

  return (
    <dl className={styles.root}>
      {seasonName ? (
        <div className={styles.row}>
          <dt>Сезон</dt>
          <dd>{seasonName}</dd>
        </div>
      ) : null}
      {typeName ? (
        <div className={styles.row}>
          <dt>Тип аромату</dt>
          <dd>{typeName}</dd>
        </div>
      ) : null}
      {priceLabel ? (
        <div className={styles.row}>
          <dt>Ціна</dt>
          <dd>{priceLabel}</dd>
        </div>
      ) : null}
      {scales.map((scale) => (
        <div key={scale.label} className={styles.row}>
          <dt>{scale.label}</dt>
          <dd>{scale.value}</dd>
        </div>
      ))}
      {noteNames.length > 0 ? (
        <div className={styles.row}>
          <dt>Ноти</dt>
          <dd>{noteNames.join(' · ')}</dd>
        </div>
      ) : null}
    </dl>
  )
}
