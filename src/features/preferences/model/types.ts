import type { NamedEntity } from '@/entities/perfume'

export type PreferenceScaleKey =
  | 'sweetness'
  | 'freshness'
  | 'woody'
  | 'spicy'
  | 'citrus'
  | 'floral'
  | 'fruity'
  | 'powdery'
  | 'smoky'
  | 'oriental'

/** UserPreferencesDto */
export type UserPreferences = {
  preferredSeason: NamedEntity | null
  preferredFragranceType: NamedEntity | null
  preferredNotes: NamedEntity[]
  sweetness: number | null
  freshness: number | null
  woody: number | null
  spicy: number | null
  citrus: number | null
  floral: number | null
  fruity: number | null
  powdery: number | null
  smoky: number | null
  oriental: number | null
  minPrice: number | null
  maxPrice: number | null
  updatedAt: string | null
}

/** UpdateUserPreferencesRequest */
export type UpdateUserPreferencesRequest = {
  preferredSeasonId?: number | null
  preferredFragranceTypeId?: number | null
  preferredNoteIds?: number[] | null
  sweetness?: number | null
  freshness?: number | null
  woody?: number | null
  spicy?: number | null
  citrus?: number | null
  floral?: number | null
  fruity?: number | null
  powdery?: number | null
  smoky?: number | null
  oriental?: number | null
  minPrice?: number | null
  maxPrice?: number | null
}

export type PreferencesFormState = {
  preferredSeasonId: string
  preferredFragranceTypeId: string
  preferredNoteIds: number[]
  minPrice: string
  maxPrice: string
  scales: Record<PreferenceScaleKey, string>
}

export const PREFERENCE_SCALE_FIELDS: Array<{
  key: PreferenceScaleKey
  label: string
}> = [
  { key: 'sweetness', label: 'Солодкість' },
  { key: 'freshness', label: 'Свіжість' },
  { key: 'woody', label: 'Деревність' },
  { key: 'spicy', label: 'Пряність' },
  { key: 'citrus', label: 'Цитрус' },
  { key: 'floral', label: 'Квітковість' },
  { key: 'fruity', label: 'Фруктовість' },
  { key: 'powdery', label: 'Пудра' },
  { key: 'smoky', label: 'Димність' },
  { key: 'oriental', label: 'Орієнтал' },
]

/** Client-facing levels; values map to backend 0..100 preferences. */
export const PREFERENCE_SCALE_LEVELS = [
  { value: '', label: 'Не задано' },
  { value: '25', label: 'Низька' },
  { value: '50', label: 'Середня' },
  { value: '75', label: 'Висока' },
]

export function createEmptyPreferencesForm(): PreferencesFormState {
  return {
    preferredSeasonId: '',
    preferredFragranceTypeId: '',
    preferredNoteIds: [],
    minPrice: '',
    maxPrice: '',
    scales: {
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
    },
  }
}

export function preferencesToForm(prefs: UserPreferences): PreferencesFormState {
  return {
    preferredSeasonId: prefs.preferredSeason ? String(prefs.preferredSeason.id) : '',
    preferredFragranceTypeId: prefs.preferredFragranceType
      ? String(prefs.preferredFragranceType.id)
      : '',
    preferredNoteIds: prefs.preferredNotes.map((note) => note.id),
    minPrice: prefs.minPrice == null ? '' : String(prefs.minPrice),
    maxPrice: prefs.maxPrice == null ? '' : String(prefs.maxPrice),
    scales: {
      sweetness: scaleToFormValue(prefs.sweetness),
      freshness: scaleToFormValue(prefs.freshness),
      woody: scaleToFormValue(prefs.woody),
      spicy: scaleToFormValue(prefs.spicy),
      citrus: scaleToFormValue(prefs.citrus),
      floral: scaleToFormValue(prefs.floral),
      fruity: scaleToFormValue(prefs.fruity),
      powdery: scaleToFormValue(prefs.powdery),
      smoky: scaleToFormValue(prefs.smoky),
      oriental: scaleToFormValue(prefs.oriental),
    },
  }
}

function scaleToFormValue(value: number | null): string {
  if (value == null) return ''
  return String(value)
}

export function hasConfiguredPreferences(prefs: UserPreferences): boolean {
  return (
    prefs.preferredSeason != null ||
    prefs.preferredFragranceType != null ||
    prefs.preferredNotes.length > 0 ||
    prefs.minPrice != null ||
    prefs.maxPrice != null ||
    PREFERENCE_SCALE_FIELDS.some(({ key }) => prefs[key] != null)
  )
}
