import {
  MATCHING_SCALE_FIELDS,
  type MatchingFormState,
  type MatchingRequest,
} from '@/features/matching/model/types'

const MAX_SELECTED_NOTES = 50

export type MatchingValidationResult =
  | { ok: true; request: MatchingRequest }
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

export function validateMatchingForm(form: MatchingFormState): MatchingValidationResult {
  const fieldErrors: Record<string, string> = {}

  let seasonId: number | undefined
  if (form.seasonId.trim()) {
    seasonId = parseOptionalPositiveInt(form.seasonId)
    if (seasonId === undefined) {
      fieldErrors.seasonId = 'Оберіть коректний сезон.'
    }
  }

  let fragranceTypeId: number | undefined
  if (form.fragranceTypeId.trim()) {
    fragranceTypeId = parseOptionalPositiveInt(form.fragranceTypeId)
    if (fragranceTypeId === undefined) {
      fieldErrors.fragranceTypeId = 'Оберіть коректний тип.'
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

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    fieldErrors.minPrice = 'Мін. ціна не може перевищувати макс. ціну.'
  }

  const scales: Partial<Record<(typeof MATCHING_SCALE_FIELDS)[number]['key'], number>> =
    {}

  for (const { key, label } of MATCHING_SCALE_FIELDS) {
    const raw = form.scales[key]
    if (!raw.trim()) continue
    const parsed = parseOptionalScale(raw)
    if (parsed === undefined) {
      fieldErrors[key] = `${label}: значення від 0 до 100.`
    } else {
      scales[key] = parsed
    }
  }

  const selectedNoteIds = [...new Set(form.selectedNoteIds)].filter((id) => id > 0)

  if (selectedNoteIds.length > MAX_SELECTED_NOTES) {
    fieldErrors.selectedNoteIds = `Можна обрати щонайбільше ${MAX_SELECTED_NOTES} нот.`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      formError: 'Перевірте параметри підбору.',
      fieldErrors,
    }
  }

  const request: MatchingRequest = {
    seasonId,
    fragranceTypeId,
    minPrice,
    maxPrice,
    selectedNoteIds: selectedNoteIds.length > 0 ? selectedNoteIds : undefined,
    ...scales,
  }

  const hasCriterion =
    request.seasonId !== undefined ||
    request.fragranceTypeId !== undefined ||
    request.minPrice !== undefined ||
    request.maxPrice !== undefined ||
    (request.selectedNoteIds?.length ?? 0) > 0 ||
    MATCHING_SCALE_FIELDS.some(({ key }) => request[key] !== undefined)

  if (!hasCriterion) {
    return {
      ok: false,
      formError: 'Вкажіть хоча б один критерій підбору.',
      fieldErrors: { criteria: 'Потрібен щонайменше один критерій.' },
    }
  }

  return { ok: true, request }
}
