import type { ScoreBreakdown } from '@/shared/scoring/types'

/** RecommendationDto — from MatchingResultDto mapping on backend */
export type Recommendation = ScoreBreakdown & {
  perfumeId: number
  name: string
  brandName: string
  price: number | null
  score: number
  reasons: string[]
}

/** RecommendationsResponse */
export type RecommendationsResponse = {
  preferencesConfigured: boolean
  message: string | null
  items: Recommendation[]
}
