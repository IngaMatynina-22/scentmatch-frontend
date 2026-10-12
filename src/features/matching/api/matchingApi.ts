import { httpRequest } from '@/shared/api/httpClient'
import type {
  GiftMatchingRequest,
  GiftMatchingResponse,
  MatchingRequest,
  MatchingResponse,
  TextMatchingRequest,
  TextMatchingResponse,
} from '@/features/matching/model/types'

export const matchingApi = {
  /** POST /api/matching — requires auth */
  match(
    request: MatchingRequest,
    signal?: AbortSignal,
  ): Promise<MatchingResponse> {
    return httpRequest<MatchingResponse>({
      path: '/api/matching',
      method: 'POST',
      body: request,
      signal,
    })
  },

  /** POST /api/matching/text — requires auth */
  matchText(
    request: TextMatchingRequest,
    signal?: AbortSignal,
  ): Promise<TextMatchingResponse> {
    return httpRequest<TextMatchingResponse>({
      path: '/api/matching/text',
      method: 'POST',
      body: request,
      signal,
    })
  },

  /** POST /api/matching/gift — AllowAnonymous */
  matchGift(
    request: GiftMatchingRequest,
    signal?: AbortSignal,
  ): Promise<GiftMatchingResponse> {
    return httpRequest<GiftMatchingResponse>({
      path: '/api/matching/gift',
      method: 'POST',
      body: request,
      signal,
    })
  },
}
