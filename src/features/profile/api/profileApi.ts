import { httpRequest } from '@/shared/api/httpClient'

export type UserProfile = {
  id: number
  email: string
  username: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type UpdateProfilePayload = {
  username: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export const profileApi = {
  get(signal?: AbortSignal): Promise<UserProfile> {
    return httpRequest<UserProfile>({ path: '/api/profile', signal })
  },

  update(payload: UpdateProfilePayload, signal?: AbortSignal): Promise<UserProfile> {
    return httpRequest<UserProfile>({
      path: '/api/profile',
      method: 'PUT',
      body: payload,
      signal,
    })
  },
}
