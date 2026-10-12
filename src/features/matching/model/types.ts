import type { ScoreBreakdown } from '@/shared/scoring/types'

/** POST /api/matching — MatchingRequest */
export type MatchingRequest = {
  seasonId?: number
  fragranceTypeId?: number
  sweetness?: number
  freshness?: number
  woody?: number
  spicy?: number
  citrus?: number
  floral?: number
  fruity?: number
  powdery?: number
  smoky?: number
  oriental?: number
  minPrice?: number
  maxPrice?: number
  intensity?: number
  concentration?: string
  gender?: string
  selectedNoteIds?: number[]
  excludedNoteIds?: number[]
}

/** MatchingResultDto */
export type MatchingResult = ScoreBreakdown & {
  perfumeId: number
  name: string
  brandName: string
  price: number | null
  score: number
  reasons: string[]
}

/** MatchingResponse */
export type MatchingResponse = {
  items: MatchingResult[]
}

/** POST /api/matching/text */
export type TextMatchingRequest = {
  text: string
  maxResults?: number
}

export type NamedId = {
  id: number
  name: string
}

export type ParsedTextCriteria = {
  seasonId: number | null
  seasonName: string | null
  fragranceTypeId: number | null
  fragranceTypeName: string | null
  minPrice: number | null
  maxPrice: number | null
  currency: string | null
  intensity: number | null
  concentration: string | null
  gender: string | null
  preferredNotes: NamedId[]
  excludedNotes: NamedId[]
}

export type TextMatchingResponse = {
  parsedCriteria: ParsedTextCriteria
  ambiguousCriteria: string[]
  items: MatchingResult[]
}

/** POST /api/matching/gift */
export type GiftMatchingRequest = {
  minPrice?: number
  maxPrice?: number
  currency?: string
  occasion?: string
  seasonId?: number
  preferredNoteIds?: number[]
  excludedNoteIds?: number[]
  intensity?: number
  fragranceTypeId?: number
  gender?: string
  maxResults?: number
}

export type GiftMatchingResponse = {
  occasion: string | null
  currency: string | null
  items: MatchingResult[]
}

export type MatchingScaleKey =
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

export type MatchingFormState = {
  seasonId: string
  fragranceTypeId: string
  minPrice: string
  maxPrice: string
  selectedNoteIds: number[]
  scales: Record<MatchingScaleKey, string>
}

export const MATCHING_SCALE_FIELDS: Array<{
  key: MatchingScaleKey
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

export function createEmptyMatchingForm(): MatchingFormState {
  return {
    seasonId: '',
    fragranceTypeId: '',
    minPrice: '',
    maxPrice: '',
    selectedNoteIds: [],
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
