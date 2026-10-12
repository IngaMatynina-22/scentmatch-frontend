import type { Perfume } from '@/entities/perfume'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type ViewHistoryItem = {
  id: number
  perfume: Perfume
  viewedAt: string | null
}

export const viewHistoryApi = {
  getList(
    query: { page?: number; pageSize?: number } = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<ViewHistoryItem>> {
    return httpRequest<PagedResult<ViewHistoryItem>>({
      path: '/api/history/views',
      query: { page: query.page, pageSize: query.pageSize },
      signal,
    })
  },

  async register(perfumeId: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/history/views/${perfumeId}`,
      method: 'POST',
      signal,
    })
  },

  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/history/views/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  async clear(signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: '/api/history/views',
      method: 'DELETE',
      signal,
    })
  },
}
