import { httpRequest } from '@/shared/api/httpClient'
import type {
  SimilarPerfumesPage,
  SimilarPerfumesQuery,
} from '@/features/similar-perfumes/model/types'

export const similarPerfumesApi = {
  /** GET /api/perfumes/{id}/similar — public */
  getSimilar(
    perfumeId: number,
    query: SimilarPerfumesQuery = {},
    signal?: AbortSignal,
  ): Promise<SimilarPerfumesPage> {
    return httpRequest<SimilarPerfumesPage>({
      path: `/api/perfumes/${perfumeId}/similar`,
      method: 'GET',
      query: {
        limit: query.limit,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
      },
      signal,
    })
  },
}
