import type { FragranceType, Note, Season } from '@/entities/perfume'
import {
  MATCHING_SCALE_FIELDS,
  type MatchingFormState,
  type MatchingScaleKey,
} from '@/features/matching/model/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import styles from './MatchingForm.module.css'

type MatchingFormProps = {
  form: MatchingFormState
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
  fieldErrors: Record<string, string>
  formError: string | null
  submitting: boolean
  onChange: (next: MatchingFormState) => void
  onSubmit: () => void
  onReset: () => void
}

export function MatchingForm({
  form,
  seasons,
  fragranceTypes,
  notes,
  fieldErrors,
  formError,
  submitting,
  onChange,
  onSubmit,
  onReset,
}: MatchingFormProps) {
  function patch(partial: Partial<MatchingFormState>) {
    onChange({ ...form, ...partial })
  }

  function patchScale(key: MatchingScaleKey, value: string) {
    onChange({
      ...form,
      scales: { ...form.scales, [key]: value },
    })
  }

  function toggleNote(noteId: number) {
    const selected = form.selectedNoteIds.includes(noteId)
      ? form.selectedNoteIds.filter((id) => id !== noteId)
      : [...form.selectedNoteIds, noteId]
    patch({ selectedNoteIds: selected })
  }

  return (
    <form
      className={styles.root}
      onSubmit={(event) => {
        event.preventDefault()
        if (!submitting) onSubmit()
      }}
      noValidate
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Параметри підбору</h2>
        <Button type="button" size="sm" variant="ghost" onClick={onReset} disabled={submitting}>
          Скинути
        </Button>
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <div className={styles.grid}>
        <Select
          label="Сезон"
          name="seasonId"
          value={form.seasonId}
          error={fieldErrors.seasonId}
          onChange={(event) => patch({ seasonId: event.target.value })}
          options={[
            { value: '', label: 'Не обрано' },
            ...seasons.map((season) => ({
              value: String(season.id),
              label: season.name,
            })),
          ]}
        />

        <Select
          label="Тип аромату"
          name="fragranceTypeId"
          value={form.fragranceTypeId}
          error={fieldErrors.fragranceTypeId}
          onChange={(event) => patch({ fragranceTypeId: event.target.value })}
          options={[
            { value: '', label: 'Не обрано' },
            ...fragranceTypes.map((type) => ({
              value: String(type.id),
              label: type.name,
            })),
          ]}
        />

        <Input
          label="Мін. ціна"
          name="minPrice"
          type="number"
          min={0}
          step="0.01"
          value={form.minPrice}
          error={fieldErrors.minPrice}
          onChange={(event) => patch({ minPrice: event.target.value })}
        />

        <Input
          label="Макс. ціна"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          value={form.maxPrice}
          error={fieldErrors.maxPrice}
          onChange={(event) => patch({ maxPrice: event.target.value })}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.subtitle}>Ароматичні шкали (0–100)</h3>
        <div className={styles.scaleGrid}>
          {MATCHING_SCALE_FIELDS.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              name={key}
              type="number"
              min={0}
              max={100}
              value={form.scales[key]}
              error={fieldErrors[key]}
              onChange={(event) => patchScale(key, event.target.value)}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subtitle}>
          Ноти
          {form.selectedNoteIds.length > 0
            ? ` · обрано ${form.selectedNoteIds.length}`
            : ''}
        </h3>
        {fieldErrors.selectedNoteIds ? (
          <p className={styles.formError} role="alert">
            {fieldErrors.selectedNoteIds}
          </p>
        ) : null}
        <div className={styles.noteList} role="group" aria-label="Ноти">
          {notes.length === 0 ? (
            <p className={styles.hint}>Довідник нот порожній.</p>
          ) : (
            notes.map((note) => {
              const checked = form.selectedNoteIds.includes(note.id)
              return (
                <label key={note.id} className={styles.noteItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNote(note.id)}
                    disabled={submitting}
                  />
                  <span>{note.name}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="accent" loading={submitting} disabled={submitting}>
          Підібрати парфуми
        </Button>
      </div>
    </form>
  )
}
