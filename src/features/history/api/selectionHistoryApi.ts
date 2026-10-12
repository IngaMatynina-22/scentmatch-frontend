import type { SelectionHistoryEntry } from '@/features/history/model/types'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type SelectionHistoryQuery = {
  page?: number
  pageSize?: number
}

export const selectionHistoryApi = {
  /** GET /api/history/selections — requires auth */
  getList(
    query: SelectionHistoryQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<SelectionHistoryEntry>> {
    return httpRequest<PagedResult<SelectionHistoryEntry>>({
      path: '/api/history/selections',
      query: {
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },

  /** GET /api/history/selections/{id} */
  getById(id: number, signal?: AbortSignal): Promise<SelectionHistoryEntry> {
    return httpRequest<SelectionHistoryEntry>({
      path: `/api/history/selections/${id}`,
      signal,
    })
  },

  /** DELETE /api/history/selections/{id} — 204 */
  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/history/selections/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  /** DELETE /api/history/selections — clear all for current user — 204 */
  async clear(signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: '/api/history/selections',
      method: 'DELETE',
      signal,
    })
  },
}
