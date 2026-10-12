import type {
  OwnReview,
  OwnReviewsQuery,
  ReviewWritePayload,
} from '@/features/reviews/model/types'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export const reviewsApi = {
  /** POST /api/perfumes/{perfumeId}/reviews */
  create(
    perfumeId: number,
    payload: ReviewWritePayload,
    signal?: AbortSignal,
  ): Promise<OwnReview> {
    return httpRequest<OwnReview>({
      path: `/api/perfumes/${perfumeId}/reviews`,
      method: 'POST',
      body: payload,
      signal,
    })
  },

  /** GET /api/perfumes/{perfumeId}/my-review */
  getMineForPerfume(perfumeId: number, signal?: AbortSignal): Promise<OwnReview> {
    return httpRequest<OwnReview>({
      path: `/api/perfumes/${perfumeId}/my-review`,
      signal,
    })
  },

  /** GET /api/reviews/mine */
  getMine(
    query: OwnReviewsQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<OwnReview>> {
    return httpRequest<PagedResult<OwnReview>>({
      path: '/api/reviews/mine',
      query: {
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },

  /** PUT /api/reviews/{id} */
  update(id: number, payload: ReviewWritePayload, signal?: AbortSignal): Promise<OwnReview> {
    return httpRequest<OwnReview>({
      path: `/api/reviews/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  /** DELETE /api/reviews/{id} */
  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/reviews/${id}`,
      method: 'DELETE',
      signal,
    })
  },
}
