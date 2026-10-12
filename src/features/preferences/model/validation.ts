import {
  PREFERENCE_SCALE_FIELDS,
  type PreferencesFormState,
  type UpdateUserPreferencesRequest,
} from '@/features/preferences/model/types'

const MAX_NOTES = 20

export type PreferencesValidationResult =
  | { ok: true; request: UpdateUserPreferencesRequest }
  | { ok: false; formError: string; fieldErrors: Record<string, string> }

function parseOptionalPositiveInt(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return parsed
}

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return parsed
}

function parseOptionalScale(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return undefined
  return parsed
}

export function validatePreferencesForm(
  form: PreferencesFormState,
): PreferencesValidationResult {
  const fieldErrors: Record<string, string> = {}

  let preferredSeasonId: number | undefined
  if (form.preferredSeasonId.trim()) {
    preferredSeasonId = parseOptionalPositiveInt(form.preferredSeasonId)
    if (preferredSeasonId === undefined) {
      fieldErrors.preferredSeasonId = 'Оберіть коректний сезон.'
    }
  }

  let preferredFragranceTypeId: number | undefined
  if (form.preferredFragranceTypeId.trim()) {
    preferredFragranceTypeId = parseOptionalPositiveInt(form.preferredFragranceTypeId)
    if (preferredFragranceTypeId === undefined) {
      fieldErrors.preferredFragranceTypeId = 'Оберіть коректний тип.'
    }
  }

  let minPrice: number | undefined
  if (form.minPrice.trim()) {
    minPrice = parseOptionalNonNegativeNumber(form.minPrice)
    if (minPrice === undefined) {
      fieldErrors.minPrice = 'Мін. ціна має бути ≥ 0.'
    }
  }

  let maxPrice: number | undefined
  if (form.maxPrice.trim()) {
    maxPrice = parseOptionalNonNegativeNumber(form.maxPrice)
    if (maxPrice === undefined) {
      fieldErrors.maxPrice = 'Макс. ціна має бути ≥ 0.'
    }
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    fieldErrors.minPrice = 'Мін. ціна не може перевищувати макс. ціну.'
  }

  const scales: Partial<Record<(typeof PREFERENCE_SCALE_FIELDS)[number]['key'], number>> =
    {}

  for (const { key, label } of PREFERENCE_SCALE_FIELDS) {
    const raw = form.scales[key]
    if (!raw.trim()) continue
    const parsed = parseOptionalScale(raw)
    if (parsed === undefined) {
      fieldErrors[key] = `${label}: значення від 0 до 100.`
    } else {
      scales[key] = parsed
    }
  }

  const preferredNoteIds = [...new Set(form.preferredNoteIds)].filter((id) => id > 0)
  if (preferredNoteIds.length > MAX_NOTES) {
    fieldErrors.preferredNoteIds = `Можна обрати щонайбільше ${MAX_NOTES} нот.`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      formError: 'Перевірте параметри уподобань.',
      fieldErrors,
    }
  }

  const request: UpdateUserPreferencesRequest = {
    preferredSeasonId: preferredSeasonId ?? null,
    preferredFragranceTypeId: preferredFragranceTypeId ?? null,
    preferredNoteIds,
    minPrice: minPrice ?? null,
    maxPrice: maxPrice ?? null,
    sweetness: scales.sweetness ?? null,
    freshness: scales.freshness ?? null,
    woody: scales.woody ?? null,
    spicy: scales.spicy ?? null,
    citrus: scales.citrus ?? null,
    floral: scales.floral ?? null,
    fruity: scales.fruity ?? null,
    powdery: scales.powdery ?? null,
    smoky: scales.smoky ?? null,
    oriental: scales.oriental ?? null,
  }

  return { ok: true, request }
}
