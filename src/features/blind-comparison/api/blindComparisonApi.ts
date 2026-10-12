import type {
  BlindComparisonRatingsRequest,
  BlindComparisonResults,
  BlindComparisonSession,
  CompleteBlindComparisonRequest,
  CreateBlindComparisonRequest,
} from '@/features/blind-comparison/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const blindComparisonApi = {
  create(
    payload: CreateBlindComparisonRequest,
    signal?: AbortSignal,
  ): Promise<BlindComparisonSession> {
    return httpRequest<BlindComparisonSession>({
      path: '/api/blind-comparison',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  getSession(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<BlindComparisonSession> {
    return httpRequest<BlindComparisonSession>({
      path: `/api/blind-comparison/${sessionId}`,
      signal,
    })
  },

  rate(
    sessionId: string,
    payload: BlindComparisonRatingsRequest,
    signal?: AbortSignal,
  ): Promise<BlindComparisonSession> {
    return httpRequest<BlindComparisonSession>({
      path: `/api/blind-comparison/${sessionId}/ratings`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  complete(
    sessionId: string,
    payload: CompleteBlindComparisonRequest = {},
    signal?: AbortSignal,
  ): Promise<BlindComparisonResults> {
    return httpRequest<BlindComparisonResults>({
      path: `/api/blind-comparison/${sessionId}/complete`,
      method: 'POST',
      body: payload,
      signal,
    })
  },

  getResults(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<BlindComparisonResults> {
    return httpRequest<BlindComparisonResults>({
      path: `/api/blind-comparison/${sessionId}/results`,
      signal,
    })
  },
}
