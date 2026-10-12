import { useEffect, useState } from 'react'
import type { Brand, FragranceType, Note, PerfumeQuery, Season } from '@/entities/perfume'
import { countActiveFilters } from '@/features/catalog/model/catalogQuery'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import styles from './CatalogFilters.module.css'

type CatalogFiltersProps = {
  query: PerfumeQuery
  brands: Brand[]
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
  onChange: (patch: Partial<PerfumeQuery>, options?: { resetPage?: boolean }) => void
  onClear: () => void
}

function selectedNoteIds(noteIds: string | undefined): number[] {
  if (!noteIds?.trim()) return []
  return noteIds
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0)
}

/** Client-facing levels mapped to backend min* thresholds (0..100). */
const SCALE_LEVEL_OPTIONS = [
  { value: '', label: 'Не важливо' },
  { value: '25', label: 'Ледь відчутна' },
  { value: '50', label: 'Помірна' },
  { value: '75', label: 'Виражена' },
]

function scaleLevelValue(value: number | undefined): string {
  if (value === undefined) return ''
  if (value >= 75) return '75'
  if (value >= 50) return '50'
  if (value >= 25) return '25'
  return ''
}

export function CatalogFilters({
  query,
  brands,
  seasons,
  fragranceTypes,
  notes,
  onChange,
  onClear,
}: CatalogFiltersProps) {
  const activeCount = countActiveFilters(query)
  const selectedNotes = selectedNoteIds(query.noteIds)
  const urlSearch = query.search ?? ''
  const [searchDraft, setSearchDraft] = useState(urlSearch)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearchDraft(urlSearch)
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim() || undefined
      if (next !== (query.search ?? undefined)) {
        onChange({ search: next }, { resetPage: true })
      }
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchDraft, query.search, onChange])

  function toggleNote(noteId: number) {
    const next = selectedNotes.includes(noteId)
      ? selectedNotes.filter((id) => id !== noteId)
      : [...selectedNotes, noteId]
    onChange({ noteIds: next.length > 0 ? next.join(',') : undefined }, { resetPage: true })
  }

  return (
    <section className={styles.root} aria-labelledby="catalog-filters-title">
      <div className={styles.header}>
        <h2 id="catalog-filters-title" className={styles.title}>
          Фільтри
          {activeCount > 0 ? <span className={styles.count}>{activeCount}</span> : null}
        </h2>
        <Button type="button" size="sm" variant="ghost" onClick={onClear} disabled={activeCount === 0}>
          Очистити
        </Button>
      </div>

      <div className={styles.grid}>
        <Input
          label="Пошук"
          name="search"
          value={searchDraft}
          placeholder="Назва або бренд"
          onChange={(event) => setSearchDraft(event.target.value)}
        />

        <Select
          label="Бренд"
          name="brandId"
          value={query.brandId ? String(query.brandId) : ''}
          onChange={(event) =>
            onChange(
              {
                brandId: event.target.value ? Number(event.target.value) : undefined,
              },
              { resetPage: true },
            )
          }
          options={[
            { value: '', label: 'Усі бренди' },
            ...brands.map((brand) => ({ value: String(brand.id), label: brand.name })),
          ]}
        />

        <Select
          label="Тип аромату"
          name="fragranceTypeId"
          value={query.fragranceTypeId ? String(query.fragranceTypeId) : ''}
          onChange={(event) =>
            onChange(
              {
                fragranceTypeId: event.target.value ? Number(event.target.value) : undefined,
              },
              { resetPage: true },
            )
          }
          options={[
            { value: '', label: 'Усі типи' },
            ...fragranceTypes.map((type) => ({ value: String(type.id), label: type.name })),
          ]}
        />

        <Select
          label="Сезон"
          name="seasonId"
          value={query.seasonId ? String(query.seasonId) : ''}
          onChange={(event) =>
            onChange(
              {
                seasonId: event.target.value ? Number(event.target.value) : undefined,
              },
              { resetPage: true },
            )
          }
          options={[
            { value: '', label: 'Усі сезони' },
            ...seasons.map((season) => ({ value: String(season.id), label: season.name })),
          ]}
        />

        <Input
          label="Мін. ціна"
          name="minPrice"
          type="number"
          min={0}
          step="0.01"
          value={query.minPrice ?? ''}
          onChange={(event) =>
            onChange(
              {
                minPrice:
                  event.target.value === '' ? undefined : Number(event.target.value),
              },
              { resetPage: true },
            )
          }
        />

        <Input
          label="Макс. ціна"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          value={query.maxPrice ?? ''}
          onChange={(event) =>
            onChange(
              {
                maxPrice:
                  event.target.value === '' ? undefined : Number(event.target.value),
              },
              { resetPage: true },
            )
          }
        />

        <Input
          label="Мін. рейтинг"
          name="minRating"
          type="number"
          min={0}
          max={5}
          step="0.1"
          value={query.minRating ?? ''}
          onChange={(event) =>
            onChange(
              {
                minRating:
                  event.target.value === '' ? undefined : Number(event.target.value),
              },
              { resetPage: true },
            )
          }
        />

        <Select
          label="Gender"
          name="gender"
          value={query.gender ?? ''}
          onChange={(event) =>
            onChange({ gender: event.target.value || undefined }, { resetPage: true })
          }
          options={[
            { value: '', label: 'Усі' },
            { value: 'Female', label: 'Female' },
            { value: 'Male', label: 'Male' },
            { value: 'Unisex', label: 'Unisex' },
          ]}
        />

        <Select
          label="Концентрація"
          name="concentration"
          value={query.concentration ?? ''}
          onChange={(event) =>
            onChange(
              { concentration: event.target.value || undefined },
              { resetPage: true },
            )
          }
          options={[
            { value: '', label: 'Усі' },
            { value: 'EDT', label: 'EDT' },
            { value: 'EDP', label: 'EDP' },
            { value: 'Parfum', label: 'Parfum' },
            { value: 'Cologne', label: 'Cologne' },
          ]}
        />
      </div>

      <div className={styles.scales}>
        <h3 className={styles.subtitle}>Ароматичні шкали (мін.)</h3>
        <p className={styles.scaleHint}>
          Оберіть мінімальний рівень вираженості — без ручного введення чисел.
        </p>
        <div className={styles.scaleGrid}>
          {(
            [
              ['minSweetness', 'Солодкість', query.minSweetness],
              ['minFreshness', 'Свіжість', query.minFreshness],
              ['minWoody', 'Деревність', query.minWoody],
              ['minSpicy', 'Пряність', query.minSpicy],
            ] as const
          ).map(([key, label, value]) => (
            <Select
              key={key}
              label={label}
              name={key}
              value={scaleLevelValue(value)}
              onChange={(event) =>
                onChange(
                  {
                    [key]:
                      event.target.value === ''
                        ? undefined
                        : Number.parseInt(event.target.value, 10),
                  },
                  { resetPage: true },
                )
              }
              options={SCALE_LEVEL_OPTIONS}
            />
          ))}
        </div>
      </div>

      <div className={styles.notes}>
        <h3 className={styles.subtitle}>Ноти (усі вибрані — AND)</h3>
        <div className={styles.noteList} role="group" aria-label="Ноти">
          {notes.map((note) => {
            const checked = selectedNotes.includes(note.id)
            return (
              <label key={note.id} className={styles.noteItem}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleNote(note.id)}
                />
                <span>{note.name}</span>
              </label>
            )
          })}
        </div>
      </div>
    </section>
  )
}
