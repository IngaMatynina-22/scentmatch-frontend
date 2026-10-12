import { useId, useState } from 'react'
import type { FragranceType, Note, Season } from '@/entities/perfume'
import type { SelectionHistoryEntry } from '@/features/history/model/types'
import { SelectionHistoryParams } from '@/features/history/ui/SelectionHistoryParams'
import { MatchingResults } from '@/features/matching/ui/MatchingResults'
import { Button } from '@/shared/ui/Button'
import styles from './SelectionHistoryCard.module.css'

type SelectionHistoryCardProps = {
  entry: SelectionHistoryEntry
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
  deleting: boolean
  onDelete: () => void
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Дата невідома'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Дата невідома'
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function SelectionHistoryCard({
  entry,
  seasons,
  fragranceTypes,
  notes,
  deleting,
  onDelete,
}: SelectionHistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const resultCount = entry.results.length

  return (
    <article className={styles.root}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{formatDateTime(entry.createdAt)}</h2>
          <p className={styles.summary}>
            {resultCount === 0
              ? 'Без збережених результатів'
              : resultCount === 1
                ? '1 результат'
                : `${resultCount} результатів`}
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Згорнути' : 'Деталі'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            loading={deleting}
            disabled={deleting}
            onClick={onDelete}
          >
            Видалити
          </Button>
        </div>
      </header>

      <div className={styles.preview}>
        <SelectionHistoryParams
          entry={entry}
          seasons={seasons}
          fragranceTypes={fragranceTypes}
          notes={notes}
        />
      </div>

      {expanded ? (
        <div id={panelId} className={styles.details}>
          <MatchingResults items={entry.results} submitted />
        </div>
      ) : null}
    </article>
  )
}
