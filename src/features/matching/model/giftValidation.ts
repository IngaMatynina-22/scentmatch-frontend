import type { GiftMatchingRequest } from '@/features/matching/model/types'

export type GiftMatchingFormState = {
  minPrice: string
  maxPrice: string
  currency: string
  occasion: string
  seasonId: string
  fragranceTypeId: string
  intensity: string
  gender: string
  preferredNoteIds: number[]
  excludedNoteIds: number[]
  maxResults: string
}

export function createEmptyGiftForm(): GiftMatchingFormState {
  return {
    minPrice: '',
    maxPrice: '',
    currency: 'EUR',
    occasion: '',
    seasonId: '',
    fragranceTypeId: '',
    intensity: '',
    gender: '',
    preferredNoteIds: [],
    excludedNoteIds: [],
    maxResults: '20',
  }
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function validateGiftMatchingForm(form: GiftMatchingFormState): {
  ok: true
  request: GiftMatchingRequest
} | {
  ok: false
  fieldErrors: Record<string, string>
  formError: string | null
} {
  const fieldErrors: Record<string, string> = {}
  const minPrice = parseOptionalNumber(form.minPrice)
  const maxPrice = parseOptionalNumber(form.maxPrice)
  const intensity = parseOptionalNumber(form.intensity)
  const maxResults = parseOptionalNumber(form.maxResults)
  const seasonId = form.seasonId ? Number.parseInt(form.seasonId, 10) : undefined
  const fragranceTypeId = form.fragranceTypeId
    ? Number.parseInt(form.fragranceTypeId, 10)
    : undefined

  if (form.minPrice.trim() && Number.isNaN(minPrice)) {
    fieldErrors.minPrice = 'Некоректна мінімальна ціна.'
  } else if (minPrice !== undefined && minPrice < 0) {
    fieldErrors.minPrice = 'Мінімальна ціна не може бути від’ємною.'
  }

  if (form.maxPrice.trim() && Number.isNaN(maxPrice)) {
    fieldErrors.maxPrice = 'Некоректна максимальна ціна.'
  } else if (maxPrice !== undefined && maxPrice < 0) {
    fieldErrors.maxPrice = 'Максимальна ціна не може бути від’ємною.'
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    !Number.isNaN(minPrice) &&
    !Number.isNaN(maxPrice) &&
    minPrice > maxPrice
  ) {
    fieldErrors.minPrice = 'Мінімальна ціна не може перевищувати максимальну.'
  }

  if (form.intensity.trim() && Number.isNaN(intensity)) {
    fieldErrors.intensity = 'Некоректна інтенсивність.'
  } else if (
    intensity !== undefined &&
    !Number.isNaN(intensity) &&
    (intensity < 0 || intensity > 100)
  ) {
    fieldErrors.intensity = 'Інтенсивність має бути від 0 до 100.'
  }

  if (form.currency.trim().length > 8) {
    fieldErrors.currency = 'Код валюти — максимум 8 символів.'
  }

  if (form.occasion.trim().length > 100) {
    fieldErrors.occasion = 'Привід — максимум 100 символів.'
  }

  if (form.gender.trim().length > 30) {
    fieldErrors.gender = 'Gender — максимум 30 символів.'
  }

  if (
    form.maxResults.trim() &&
    (Number.isNaN(maxResults) ||
      maxResults === undefined ||
      maxResults < 1 ||
      maxResults > 50)
  ) {
    fieldErrors.maxResults = 'Кількість результатів: від 1 до 50.'
  }

  if (form.preferredNoteIds.length > 50) {
    fieldErrors.preferredNoteIds = 'Не більше 50 бажаних нот.'
  }

  if (form.excludedNoteIds.length > 50) {
    fieldErrors.excludedNoteIds = 'Не більше 50 небажаних нот.'
  }

  const hasCriterion =
    minPrice !== undefined ||
    maxPrice !== undefined ||
    Boolean(form.seasonId) ||
    Boolean(form.fragranceTypeId) ||
    intensity !== undefined ||
    Boolean(form.gender.trim()) ||
    Boolean(form.occasion.trim()) ||
    form.preferredNoteIds.length > 0 ||
    form.excludedNoteIds.length > 0

  if (!hasCriterion) {
    return {
      ok: false,
      fieldErrors,
      formError: 'Вкажіть хоча б один критерій подарунка.',
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
      formError: 'Перевірте поля форми.',
    }
  }

  const request: GiftMatchingRequest = {
    maxResults: maxResults ?? 20,
  }

  if (minPrice !== undefined) request.minPrice = minPrice
  if (maxPrice !== undefined) request.maxPrice = maxPrice
  if (form.currency.trim()) request.currency = form.currency.trim()
  if (form.occasion.trim()) request.occasion = form.occasion.trim()
  if (seasonId && Number.isFinite(seasonId)) request.seasonId = seasonId
  if (fragranceTypeId && Number.isFinite(fragranceTypeId)) {
    request.fragranceTypeId = fragranceTypeId
  }
  if (intensity !== undefined) request.intensity = intensity
  if (form.gender.trim()) request.gender = form.gender.trim()
  if (form.preferredNoteIds.length > 0) {
    request.preferredNoteIds = form.preferredNoteIds
  }
  if (form.excludedNoteIds.length > 0) {
    request.excludedNoteIds = form.excludedNoteIds
  }

  return { ok: true, request }
}
