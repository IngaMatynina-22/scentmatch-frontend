import { useState } from 'react'
import type { Brand, FragranceType, Note, Season } from '@/entities/perfume'
import type { PerfumeWritePayload } from '@/features/admin/model/types'
import { NOTE_TYPES } from '@/features/admin/model/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import styles from './AdminPerfumeForm.module.css'

export type PerfumeFormState = {
  name: string
  brandId: string
  fragranceTypeId: string
  description: string
  releaseYear: string
  concentration: string
  gender: string
  price: string
  imageUrl: string
  sweetness: string
  freshness: string
  woody: string
  spicy: string
  citrus: string
  floral: string
  fruity: string
  powdery: string
  smoky: string
  oriental: string
  noteId: string
  noteType: string
  notes: Array<{ noteId: number; noteType: string; label: string }>
  seasonId: string
  suitability: string
  seasons: Array<{ seasonId: number; suitability: number; label: string }>
  storeName: string
  storeUrl: string
  shopLinks: Array<{ storeName: string; url: string }>
}

export function emptyPerfumeForm(): PerfumeFormState {
  return {
    name: '',
    brandId: '',
    fragranceTypeId: '',
    description: '',
    releaseYear: '',
    concentration: '',
    gender: '',
    price: '',
    imageUrl: '',
    sweetness: '',
    freshness: '',
    woody: '',
    spicy: '',
    citrus: '',
    floral: '',
    fruity: '',
    powdery: '',
    smoky: '',
    oriental: '',
    noteId: '',
    noteType: 'Top',
    notes: [],
    seasonId: '',
    suitability: '50',
    seasons: [],
    storeName: '',
    storeUrl: '',
    shopLinks: [],
  }
}

function optionalInt(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function perfumeFormToPayload(form: PerfumeFormState): PerfumeWritePayload {
  const scales = {
    sweetness: optionalInt(form.sweetness),
    freshness: optionalInt(form.freshness),
    woody: optionalInt(form.woody),
    spicy: optionalInt(form.spicy),
    citrus: optionalInt(form.citrus),
    floral: optionalInt(form.floral),
    fruity: optionalInt(form.fruity),
    powdery: optionalInt(form.powdery),
    smoky: optionalInt(form.smoky),
    oriental: optionalInt(form.oriental),
  }
  const hasScale = Object.values(scales).some((value) => value != null)

  return {
    name: form.name.trim(),
    brandId: Number.parseInt(form.brandId, 10),
    fragranceTypeId: Number.parseInt(form.fragranceTypeId, 10),
    description: form.description.trim() || null,
    releaseYear: optionalInt(form.releaseYear),
    concentration: form.concentration.trim() || null,
    gender: form.gender.trim() || null,
    price: optionalNumber(form.price),
    imageUrl: form.imageUrl.trim() || null,
    characteristics: hasScale ? scales : null,
    notes: form.notes.map(({ noteId, noteType }) => ({ noteId, noteType })),
    seasons: form.seasons.map(({ seasonId, suitability }) => ({ seasonId, suitability })),
    shopLinks: form.shopLinks.map(({ storeName, url }) => ({ storeName, url })),
  }
}

type AdminPerfumeFormProps = {
  form: PerfumeFormState
  brands: Brand[]
  fragranceTypes: FragranceType[]
  notes: Note[]
  seasons: Season[]
  fieldErrors: Record<string, string>
  formError: string | null
  submitting: boolean
  submitLabel: string
  onChange: (next: PerfumeFormState) => void
  onSubmit: () => void
  onCancel?: () => void
}

export function AdminPerfumeForm({
  form,
  brands,
  fragranceTypes,
  notes,
  seasons,
  fieldErrors,
  formError,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: AdminPerfumeFormProps) {
  const [shopLinkError, setShopLinkError] = useState<string | null>(null)

  function patch(partial: Partial<PerfumeFormState>) {
    onChange({ ...form, ...partial })
  }

  function addNote() {
    const noteId = Number.parseInt(form.noteId, 10)
    if (!Number.isFinite(noteId) || noteId <= 0) return
    if (form.notes.some((item) => item.noteId === noteId)) return
    const note = notes.find((item) => item.id === noteId)
    patch({
      notes: [
        ...form.notes,
        { noteId, noteType: form.noteType || 'Top', label: note?.name ?? `#${noteId}` },
      ],
      noteId: '',
    })
  }

  function addSeason() {
    const seasonId = Number.parseInt(form.seasonId, 10)
    const suitability = Number.parseInt(form.suitability || '50', 10)
    if (!Number.isFinite(seasonId) || seasonId <= 0) return
    if (form.seasons.some((item) => item.seasonId === seasonId)) return
    const season = seasons.find((item) => item.id === seasonId)
    patch({
      seasons: [
        ...form.seasons,
        {
          seasonId,
          suitability: Number.isFinite(suitability) ? suitability : 50,
          label: season?.name ?? `#${seasonId}`,
        },
      ],
      seasonId: '',
    })
  }

  function addShopLink() {
    const storeName = form.storeName.trim()
    const url = form.storeUrl.trim()
    if (!storeName || !url) {
      setShopLinkError('Вкажіть назву магазину та URL.')
      return
    }
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setShopLinkError('URL має починатися з http:// або https://.')
        return
      }
    } catch {
      setShopLinkError('URL має бути валідною адресою http/https.')
      return
    }
    setShopLinkError(null)
    patch({
      shopLinks: [...form.shopLinks, { storeName, url }],
      storeName: '',
      storeUrl: '',
    })
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
      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <div className={styles.grid}>
        <Input
          label="Назва"
          value={form.name}
          required
          maxLength={250}
          error={fieldErrors.name}
          disabled={submitting}
          onChange={(event) => patch({ name: event.target.value })}
        />
        <Select
          label="Бренд"
          value={form.brandId}
          error={fieldErrors.brandId}
          disabled={submitting}
          options={[
            { value: '', label: 'Оберіть бренд' },
            ...brands.map((brand) => ({ value: String(brand.id), label: brand.name })),
          ]}
          onChange={(event) => patch({ brandId: event.target.value })}
        />
        <Select
          label="Тип аромату"
          value={form.fragranceTypeId}
          error={fieldErrors.fragranceTypeId}
          disabled={submitting}
          options={[
            { value: '', label: 'Оберіть тип' },
            ...fragranceTypes.map((type) => ({ value: String(type.id), label: type.name })),
          ]}
          onChange={(event) => patch({ fragranceTypeId: event.target.value })}
        />
        <Input
          label="Рік"
          value={form.releaseYear}
          error={fieldErrors.releaseYear}
          disabled={submitting}
          onChange={(event) => patch({ releaseYear: event.target.value })}
        />
        <Input
          label="Концентрація"
          value={form.concentration}
          maxLength={50}
          disabled={submitting}
          onChange={(event) => patch({ concentration: event.target.value })}
        />
        <Input
          label="Стать"
          value={form.gender}
          maxLength={50}
          disabled={submitting}
          onChange={(event) => patch({ gender: event.target.value })}
        />
        <Input
          label="Ціна"
          value={form.price}
          error={fieldErrors.price}
          disabled={submitting}
          onChange={(event) => patch({ price: event.target.value })}
        />
        <Input
          label="Image URL"
          value={form.imageUrl}
          maxLength={1000}
          error={fieldErrors.imageUrl}
          disabled={submitting}
          onChange={(event) => patch({ imageUrl: event.target.value })}
        />
      </div>

      <Textarea
        label="Опис"
        value={form.description}
        disabled={submitting}
        onChange={(event) => patch({ description: event.target.value })}
      />

      <h3 className={styles.subtitle}>Характеристики (0–100)</h3>
      <div className={styles.grid}>
        {(
          [
            ['sweetness', 'Солодкість'],
            ['freshness', 'Свіжість'],
            ['woody', 'Деревність'],
            ['spicy', 'Пряність'],
            ['citrus', 'Цитрус'],
            ['floral', 'Квітковість'],
            ['fruity', 'Фруктовість'],
            ['powdery', 'Пудра'],
            ['smoky', 'Димність'],
            ['oriental', 'Орієнтал'],
          ] as const
        ).map(([key, label]) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            disabled={submitting}
            onChange={(event) => patch({ [key]: event.target.value })}
          />
        ))}
      </div>

      <h3 className={styles.subtitle}>Ноти</h3>
      <div className={styles.row}>
        <Select
          label="Нота"
          value={form.noteId}
          disabled={submitting}
          options={[
            { value: '', label: 'Оберіть ноту' },
            ...notes.map((note) => ({ value: String(note.id), label: note.name })),
          ]}
          onChange={(event) => patch({ noteId: event.target.value })}
        />
        <Select
          label="Тип ноти"
          value={form.noteType}
          disabled={submitting}
          options={NOTE_TYPES.map((type) => ({ value: type, label: type }))}
          onChange={(event) => patch({ noteType: event.target.value })}
        />
        <Button type="button" size="sm" variant="ghost" disabled={submitting} onClick={addNote}>
          Додати ноту
        </Button>
      </div>
      {form.notes.length > 0 ? (
        <ul className={styles.chips}>
          {form.notes.map((note) => (
            <li key={note.noteId}>
              <button
                type="button"
                className={styles.chip}
                disabled={submitting}
                onClick={() =>
                  patch({ notes: form.notes.filter((item) => item.noteId !== note.noteId) })
                }
              >
                {note.label} · {note.noteType} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className={styles.subtitle}>Сезони</h3>
      <div className={styles.row}>
        <Select
          label="Сезон"
          value={form.seasonId}
          disabled={submitting}
          options={[
            { value: '', label: 'Оберіть сезон' },
            ...seasons.map((season) => ({ value: String(season.id), label: season.name })),
          ]}
          onChange={(event) => patch({ seasonId: event.target.value })}
        />
        <Input
          label="Suitability"
          value={form.suitability}
          disabled={submitting}
          onChange={(event) => patch({ suitability: event.target.value })}
        />
        <Button type="button" size="sm" variant="ghost" disabled={submitting} onClick={addSeason}>
          Додати сезон
        </Button>
      </div>
      {form.seasons.length > 0 ? (
        <ul className={styles.chips}>
          {form.seasons.map((season) => (
            <li key={season.seasonId}>
              <button
                type="button"
                className={styles.chip}
                disabled={submitting}
                onClick={() =>
                  patch({
                    seasons: form.seasons.filter((item) => item.seasonId !== season.seasonId),
                  })
                }
              >
                {season.label} · {season.suitability} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className={styles.subtitle}>Посилання магазинів</h3>
      <div className={styles.row}>
        <Input
          label="Магазин"
          value={form.storeName}
          maxLength={100}
          disabled={submitting}
          onChange={(event) => {
            setShopLinkError(null)
            patch({ storeName: event.target.value })
          }}
        />
        <Input
          label="URL"
          value={form.storeUrl}
          maxLength={1000}
          error={shopLinkError ?? undefined}
          disabled={submitting}
          onChange={(event) => {
            setShopLinkError(null)
            patch({ storeUrl: event.target.value })
          }}
        />
        <Button type="button" size="sm" variant="ghost" disabled={submitting} onClick={addShopLink}>
          Додати посилання
        </Button>
      </div>
      {form.shopLinks.length > 0 ? (
        <ul className={styles.chips}>
          {form.shopLinks.map((link, index) => (
            <li key={`${link.url}-${index}`}>
              <button
                type="button"
                className={styles.chip}
                disabled={submitting}
                onClick={() =>
                  patch({ shopLinks: form.shopLinks.filter((_, i) => i !== index) })
                }
              >
                {link.storeName} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={submitting} onClick={onCancel}>
            Скасувати
          </Button>
        ) : null}
      </div>
    </form>
  )
}
