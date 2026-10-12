import type { Recommendation } from '@/features/recommendations/model/types'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type RecommendationHistorySummary = {
  batchId: string
  createdAt: string | null
  itemCount: number
  topScore: number | null
}

export type RecommendationHistoryDetails = {
  batchId: string
  createdAt: string | null
  items: Recommendation[]
}

export const recommendationHistoryApi = {
  getBatches(
    query: { page?: number; pageSize?: number } = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<RecommendationHistorySummary>> {
    return httpRequest<PagedResult<RecommendationHistorySummary>>({
      path: '/api/history/recommendations',
      query: { page: query.page, pageSize: query.pageSize },
      signal,
    })
  },

  getBatch(batchId: string, signal?: AbortSignal): Promise<RecommendationHistoryDetails> {
    return httpRequest<RecommendationHistoryDetails>({
      path: `/api/history/recommendations/${batchId}`,
      signal,
    })
  },
}
