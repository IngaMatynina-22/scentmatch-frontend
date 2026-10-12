import type { NamedEntity, Perfume } from '@/entities/perfume'

/** POST /api/comparison body — ComparisonRequest */
export type ComparisonRequest = {
  perfumeIds: number[]
}

export type ComparisonScalarField = {
  isCommon: boolean
  values: Array<string | null>
}

export type ComparisonNumericField = {
  isCommon: boolean
  values: Array<number | null>
}

export type ComparisonCharacteristicField = {
  name: string
  isCommon: boolean
  values: Array<number | null>
}

/** ComparisonAnalysisDto */
export type ComparisonAnalysis = {
  commonNotes: NamedEntity[]
  differingNotes: NamedEntity[]
  commonSeasons: NamedEntity[]
  differingSeasons: NamedEntity[]
  brand: ComparisonScalarField
  fragranceType: ComparisonScalarField
  concentration: ComparisonScalarField
  gender: ComparisonScalarField
  rating: ComparisonNumericField
  price: ComparisonNumericField
  releaseYear: ComparisonNumericField
  characteristics: ComparisonCharacteristicField[]
}

/** ComparisonResponse */
export type ComparisonResponse = {
  items: Perfume[]
  analysis: ComparisonAnalysis
}

/** Client-side selection summary for tray / cards without refetch. */
export type CompareSelectionItem = {
  id: number
  name: string
  brandName: string
}

export type AddToComparisonResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'limit' | 'invalid' }
