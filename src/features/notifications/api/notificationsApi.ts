import type {
  NotificationItem,
  UnreadNotificationCount,
} from '@/features/notifications/model/types'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type NotificationsQuery = {
  page?: number
  pageSize?: number
}

export const notificationsApi = {
  /** GET /api/notifications — requires auth */
  getList(
    query: NotificationsQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<NotificationItem>> {
    return httpRequest<PagedResult<NotificationItem>>({
      path: '/api/notifications',
      query: {
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },

  /** GET /api/notifications/unread-count */
  getUnreadCount(signal?: AbortSignal): Promise<UnreadNotificationCount> {
    return httpRequest<UnreadNotificationCount>({
      path: '/api/notifications/unread-count',
      signal,
    })
  },

  /** PUT /api/notifications/{id}/read — 204 */
  async markAsRead(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/notifications/${id}/read`,
      method: 'PUT',
      signal,
    })
  },

  /** PUT /api/notifications/read-all — 204 */
  async markAllAsRead(signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: '/api/notifications/read-all',
      method: 'PUT',
      signal,
    })
  },

  /** DELETE /api/notifications/{id} — 204 */
  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/notifications/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  /** DELETE /api/notifications — clear all — 204 */
  async clear(signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: '/api/notifications',
      method: 'DELETE',
      signal,
    })
  },
}
