import { httpRequest } from '@/shared/api/httpClient'
import type {
  PreferenceAnalytics,
  ResetPersonalizationRequest,
  ResetPersonalizationResponse,
} from '@/features/analytics/model/types'

export const analyticsApi = {
  /** GET /api/analytics/preferences */
  getPreferences(signal?: AbortSignal): Promise<PreferenceAnalytics> {
    return httpRequest<PreferenceAnalytics>({
      path: '/api/analytics/preferences',
      method: 'GET',
      signal,
    })
  },

  /** POST /api/analytics/personalization/reset */
  resetPersonalization(
    request: ResetPersonalizationRequest = {},
    signal?: AbortSignal,
  ): Promise<ResetPersonalizationResponse> {
    return httpRequest<ResetPersonalizationResponse>({
      path: '/api/analytics/personalization/reset',
      method: 'POST',
      body: request,
      signal,
    })
  },
}
