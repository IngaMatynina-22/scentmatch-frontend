import { useEffect, useState } from 'react'
import type { Perfume } from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { collectionsApi } from '@/features/collections/api/collectionsApi'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import styles from './AddPerfumePanel.module.css'

type AddPerfumePanelProps = {
  collectionId: number
  existingPerfumeIds: ReadonlySet<number>
  onAdded: () => void
}

export function AddPerfumePanel({
  collectionId,
  existingPerfumeIds,
  onAdded,
}: AddPerfumePanelProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [results, setResults] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([])
      setSearchError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setSearchError(null)
      try {
        const page = await catalogApi.getPerfumes(
          {
            search: debouncedSearch,
            page: 1,
            pageSize: 8,
            sortBy: 'name',
            sortOrder: 'asc',
          },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResults(page.items)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setResults([])
        setSearchError(getApiErrorMessage(error, 'Не вдалося шукати парфуми.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [debouncedSearch])

  async function handleAdd(perfumeId: number) {
    if (pendingId !== null || existingPerfumeIds.has(perfumeId)) return

    setPendingId(perfumeId)
    setActionError(null)
    try {
      await collectionsApi.addPerfume(collectionId, perfumeId)
      onAdded()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT') {
        setActionError('Цей парфум уже є в колекції.')
        onAdded()
        return
      }
      setActionError(getApiErrorMessage(error, 'Не вдалося додати парфум.'))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className={styles.root} aria-labelledby="add-perfume-heading">
      <h2 id="add-perfume-heading" className={styles.title}>
        Додати парфум
      </h2>
      <p className={styles.hint}>Пошук у каталозі за назвою або брендом.</p>

      <Input
        label="Пошук"
        name="collectionPerfumeSearch"
        value={search}
        placeholder="Наприклад, Chanel"
        onChange={(event) => setSearch(event.target.value)}
      />

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? <p className={styles.status}>Пошук…</p> : null}
      {searchError ? (
        <p className={styles.error} role="alert">
          {searchError}
        </p>
      ) : null}

      {!loading && !searchError && debouncedSearch && results.length === 0 ? (
        <p className={styles.status}>Нічого не знайдено.</p>
      ) : null}

      {results.length > 0 ? (
        <ul className={styles.list}>
          {results.map((perfume) => {
            const alreadyIn = existingPerfumeIds.has(perfume.id)
            const pending = pendingId === perfume.id
            return (
              <li key={perfume.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <p className={styles.itemBrand}>{perfume.brand.name}</p>
                  <p className={styles.itemName}>{perfume.name}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={alreadyIn ? 'ghost' : 'accent'}
                  loading={pending}
                  disabled={alreadyIn || pendingId !== null}
                  onClick={() => void handleAdd(perfume.id)}
                >
                  {alreadyIn ? 'Уже в колекції' : 'Додати'}
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
