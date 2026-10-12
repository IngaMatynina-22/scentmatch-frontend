import { httpRequest } from '@/shared/api/httpClient'
import type {
  UpdateUserPreferencesRequest,
  UserPreferences,
} from '@/features/preferences/model/types'

export const preferencesApi = {
  /** GET /api/profile/preferences — requires auth */
  get(signal?: AbortSignal): Promise<UserPreferences> {
    return httpRequest<UserPreferences>({
      path: '/api/profile/preferences',
      signal,
    })
  },

  /** PUT /api/profile/preferences — requires auth; upsert */
  update(
    request: UpdateUserPreferencesRequest,
    signal?: AbortSignal,
  ): Promise<UserPreferences> {
    return httpRequest<UserPreferences>({
      path: '/api/profile/preferences',
      method: 'PUT',
      body: request,
      signal,
    })
  },
}
