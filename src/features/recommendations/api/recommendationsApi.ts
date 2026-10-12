import { httpRequest } from '@/shared/api/httpClient'
import type { RecommendationsResponse } from '@/features/recommendations/model/types'

export const recommendationsApi = {
  /** GET /api/recommendations — requires auth */
  get(signal?: AbortSignal): Promise<RecommendationsResponse> {
    return httpRequest<RecommendationsResponse>({
      path: '/api/recommendations',
      signal,
    })
  },

  /** POST /api/recommendations/refresh — requires auth; persists history batch */
  refresh(signal?: AbortSignal): Promise<RecommendationsResponse> {
    return httpRequest<RecommendationsResponse>({
      path: '/api/recommendations/refresh',
      method: 'POST',
      signal,
    })
  },
}
