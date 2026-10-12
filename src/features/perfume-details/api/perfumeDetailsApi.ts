import type { Perfume, Review, ReviewQuery } from '@/entities/perfume'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export const perfumeDetailsApi = {
  /** GET /api/perfumes/{id} */
  getById(id: number, signal?: AbortSignal): Promise<Perfume> {
    return httpRequest<Perfume>({
      path: `/api/perfumes/${id}`,
      signal,
    })
  },

  /** GET /api/perfumes/{perfumeId}/reviews — approved only */
  getApprovedReviews(
    perfumeId: number,
    query: ReviewQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<Review>> {
    return httpRequest<PagedResult<Review>>({
      path: `/api/perfumes/${perfumeId}/reviews`,
      query: {
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },
}
