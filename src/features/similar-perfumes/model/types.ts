import type { ScoreBreakdown } from '@/shared/scoring/types'
import type { PagedResult } from '@/shared/api/paging'

/** PerfumeSummaryDto */
export type PerfumeSummary = {
  id: number
  name: string
  brandName: string
  fragranceTypeName: string
  price: number | null
  currency: string | null
  imageUrl: string | null
}

/** SimilarPerfumeDto */
export type SimilarPerfume = ScoreBreakdown & {
  perfume: PerfumeSummary
  totalScore: number
}

/** SimilarPerfumesQuery */
export type SimilarPerfumesQuery = {
  limit?: number
  page?: number
  pageSize?: number
}

export type SimilarPerfumesPage = PagedResult<SimilarPerfume>
