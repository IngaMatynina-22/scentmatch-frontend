import type {
  CreatePriceWatchRequest,
  PriceSnapshot,
  PriceWatch,
  PriceWatchPage,
  UpdatePriceWatchRequest,
} from '@/features/price-watches/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const priceWatchesApi = {
  create(
    payload: CreatePriceWatchRequest,
    signal?: AbortSignal,
  ): Promise<PriceWatch> {
    return httpRequest<PriceWatch>({
      path: '/api/price-watches',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  getList(
    query: { page?: number; pageSize?: number } = {},
    signal?: AbortSignal,
  ): Promise<PriceWatchPage> {
    return httpRequest<PriceWatchPage>({
      path: '/api/price-watches',
      query: { page: query.page, pageSize: query.pageSize },
      signal,
    })
  },

  getById(id: number, signal?: AbortSignal): Promise<PriceWatch> {
    return httpRequest<PriceWatch>({ path: `/api/price-watches/${id}`, signal })
  },

  update(
    id: number,
    payload: UpdatePriceWatchRequest,
    signal?: AbortSignal,
  ): Promise<PriceWatch> {
    return httpRequest<PriceWatch>({
      path: `/api/price-watches/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/price-watches/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  getHistory(id: number, signal?: AbortSignal): Promise<PriceSnapshot[]> {
    return httpRequest<PriceSnapshot[]>({
      path: `/api/price-watches/${id}/history`,
      signal,
    })
  },
}
