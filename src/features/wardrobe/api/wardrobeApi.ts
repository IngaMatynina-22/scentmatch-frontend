import type {
  AssignWardrobeRequest,
  WardrobeResponse,
  WardrobeStats,
} from '@/features/wardrobe/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const wardrobeApi = {
  get(signal?: AbortSignal): Promise<WardrobeResponse> {
    return httpRequest<WardrobeResponse>({ path: '/api/wardrobe', signal })
  },

  getStats(signal?: AbortSignal): Promise<WardrobeStats> {
    return httpRequest<WardrobeStats>({ path: '/api/wardrobe/stats', signal })
  },

  async assign(
    payload: AssignWardrobeRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    await httpRequest<null>({
      path: '/api/wardrobe/assign',
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  async removePerfume(
    scenarioKey: string,
    perfumeId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    await httpRequest<null>({
      path: `/api/wardrobe/${encodeURIComponent(scenarioKey)}/perfumes/${perfumeId}`,
      method: 'DELETE',
      signal,
    })
  },
}
