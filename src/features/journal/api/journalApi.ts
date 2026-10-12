import type {
  CreateJournalEntryRequest,
  JournalEntry,
  JournalPage,
  JournalQuery,
  UpdateJournalEntryRequest,
} from '@/features/journal/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const journalApi = {
  getList(query: JournalQuery = {}, signal?: AbortSignal): Promise<JournalPage> {
    return httpRequest<JournalPage>({
      path: '/api/journal',
      query: {
        page: query.page,
        pageSize: query.pageSize,
        perfumeId: query.perfumeId,
        rating: query.rating,
        from: query.from,
        to: query.to,
      },
      signal,
    })
  },

  getById(id: number, signal?: AbortSignal): Promise<JournalEntry> {
    return httpRequest<JournalEntry>({ path: `/api/journal/${id}`, signal })
  },

  create(
    payload: CreateJournalEntryRequest,
    signal?: AbortSignal,
  ): Promise<JournalEntry> {
    return httpRequest<JournalEntry>({
      path: '/api/journal',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  update(
    id: number,
    payload: UpdateJournalEntryRequest,
    signal?: AbortSignal,
  ): Promise<JournalEntry> {
    return httpRequest<JournalEntry>({
      path: `/api/journal/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/journal/${id}`,
      method: 'DELETE',
      signal,
    })
  },
}
