import type { Perfume } from '@/entities/perfume'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type FavoritesQuery = {
  page?: number
  pageSize?: number
}

export const favoritesApi = {
  /** GET /api/favorites — requires auth */
  getList(
    query: FavoritesQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<Perfume>> {
    return httpRequest<PagedResult<Perfume>>({
      path: '/api/favorites',
      query: {
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },

  /** POST /api/favorites/{perfumeId} — 201 Created */
  async add(perfumeId: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/favorites/${perfumeId}`,
      method: 'POST',
      signal,
    })
  },

  /** DELETE /api/favorites/{perfumeId} — 204 No Content */
  async remove(perfumeId: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/favorites/${perfumeId}`,
      method: 'DELETE',
      signal,
    })
  },
}
