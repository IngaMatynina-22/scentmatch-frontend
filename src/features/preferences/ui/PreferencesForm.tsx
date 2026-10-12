import type { FragranceType, Note, Season } from '@/entities/perfume'
import {
  PREFERENCE_SCALE_FIELDS,
  PREFERENCE_SCALE_LEVELS,
  type PreferenceScaleKey,
  type PreferencesFormState,
} from '@/features/preferences/model/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import styles from './PreferencesForm.module.css'

type PreferencesFormProps = {
  form: PreferencesFormState
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
  fieldErrors: Record<string, string>
  formError: string | null
  successMessage: string | null
  submitting: boolean
  onChange: (next: PreferencesFormState) => void
  onSubmit: () => void
  onReset: () => void
}

function scaleOptions(current: string) {
  const options = [...PREFERENCE_SCALE_LEVELS]
  if (current && !options.some((option) => option.value === current)) {
    options.push({ value: current, label: `Поточне · ${current}` })
  }
  return options
}

export function PreferencesForm({
  form,
  seasons,
  fragranceTypes,
  notes,
  fieldErrors,
  formError,
  successMessage,
  submitting,
  onChange,
  onSubmit,
  onReset,
}: PreferencesFormProps) {
  function patch(partial: Partial<PreferencesFormState>) {
    onChange({ ...form, ...partial })
  }

  function patchScale(key: PreferenceScaleKey, value: string) {
    onChange({
      ...form,
      scales: { ...form.scales, [key]: value },
    })
  }

  function toggleNote(noteId: number) {
    const selected = form.preferredNoteIds.includes(noteId)
      ? form.preferredNoteIds.filter((id) => id !== noteId)
      : [...form.preferredNoteIds, noteId]
    patch({ preferredNoteIds: selected })
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
        <h2 className={styles.title}>Ваші уподобання</h2>
        <Button type="button" size="sm" variant="ghost" onClick={onReset} disabled={submitting}>
          Скинути зміни
        </Button>
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      ) : null}

      <div className={styles.grid}>
        <Select
          label="Улюблений сезон"
          name="preferredSeasonId"
          value={form.preferredSeasonId}
          error={fieldErrors.preferredSeasonId}
          onChange={(event) => patch({ preferredSeasonId: event.target.value })}
          options={[
            { value: '', label: 'Не обрано' },
            ...seasons.map((season) => ({
              value: String(season.id),
              label: season.name,
            })),
          ]}
        />

        <Select
          label="Улюблений тип аромату"
          name="preferredFragranceTypeId"
          value={form.preferredFragranceTypeId}
          error={fieldErrors.preferredFragranceTypeId}
          onChange={(event) => patch({ preferredFragranceTypeId: event.target.value })}
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
        <h3 className={styles.subtitle}>Ароматичні уподобання</h3>
        <p className={styles.hint}>
          Оберіть рівень вираженості — значення зберігаються як 0–100 на сервері.
        </p>
        <div className={styles.scaleGrid}>
          {PREFERENCE_SCALE_FIELDS.map(({ key, label }) => (
            <Select
              key={key}
              label={label}
              name={key}
              value={form.scales[key]}
              error={fieldErrors[key]}
              onChange={(event) => patchScale(key, event.target.value)}
              options={scaleOptions(form.scales[key])}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subtitle}>
          Улюблені ноти
          {form.preferredNoteIds.length > 0
            ? ` · обрано ${form.preferredNoteIds.length}`
            : ''}
        </h3>
        {fieldErrors.preferredNoteIds ? (
          <p className={styles.formError} role="alert">
            {fieldErrors.preferredNoteIds}
          </p>
        ) : null}
        <div className={styles.noteList} role="group" aria-label="Улюблені ноти">
          {notes.length === 0 ? (
            <p className={styles.hint}>Довідник нот порожній.</p>
          ) : (
            notes.map((note) => {
              const checked = form.preferredNoteIds.includes(note.id)
              return (
                <label key={note.id} className={styles.noteItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={submitting}
                    onChange={() => toggleNote(note.id)}
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
          Зберегти уподобання
        </Button>
      </div>
    </form>
  )
}
