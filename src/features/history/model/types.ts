import type { MatchingResult, MatchingScaleKey } from '@/features/matching/model/types'
import { MATCHING_SCALE_FIELDS } from '@/features/matching/model/types'

/** SelectionHistoryResultItemDto — same shape as MatchingResultDto */
export type SelectionHistoryResult = MatchingResult

/** SelectionHistoryDto */
export type SelectionHistoryEntry = {
  id: number
  seasonId: number | null
  fragranceTypeId: number | null
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
  selectedNoteIds: number[]
  results: SelectionHistoryResult[]
  createdAt: string | null
}

export const HISTORY_SCALE_FIELDS = MATCHING_SCALE_FIELDS

export type HistoryScaleKey = MatchingScaleKey

export function getHistoryScaleValue(
  entry: SelectionHistoryEntry,
  key: HistoryScaleKey,
): number | null {
  return entry[key]
}
