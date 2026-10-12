import { Link } from 'react-router-dom'
import type { CollectionSummary } from '@/features/collections/model/types'
import { collectionPath } from '@/shared/constants/routes'
import styles from './CollectionListItem.module.css'

type CollectionListItemProps = {
  collection: CollectionSummary
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function CollectionListItem({ collection }: CollectionListItemProps) {
  const updated = formatDate(collection.updatedAt ?? collection.createdAt)
  const countLabel =
    collection.perfumeCount === 1
      ? '1 парфум'
      : `${collection.perfumeCount} парфумів`

  return (
    <Link to={collectionPath(collection.id)} className={styles.root}>
      <div className={styles.body}>
        <h2 className={styles.name}>{collection.name}</h2>
        {collection.description ? (
          <p className={styles.description}>{collection.description}</p>
        ) : (
          <p className={styles.descriptionMuted}>Без опису</p>
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.count}>{countLabel}</span>
        {updated ? <span className={styles.date}>{updated}</span> : null}
      </div>
    </Link>
  )
}
