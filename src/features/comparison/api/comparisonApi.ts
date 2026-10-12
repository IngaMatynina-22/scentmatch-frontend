import { httpRequest } from '@/shared/api/httpClient'
import type {
  ComparisonRequest,
  ComparisonResponse,
} from '@/features/comparison/model/types'

export const comparisonApi = {
  /** POST /api/comparison — anonymous, 2..5 unique perfume ids */
  compare(
    request: ComparisonRequest,
    signal?: AbortSignal,
  ): Promise<ComparisonResponse> {
    return httpRequest<ComparisonResponse>({
      path: '/api/comparison',
      method: 'POST',
      body: request,
      skipAuth: true,
      signal,
    })
  },
}
