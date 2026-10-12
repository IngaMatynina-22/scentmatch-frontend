import type {
  CreateWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistItem,
  WishlistPage,
  WishlistQuery,
} from '@/features/wishlist/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const wishlistApi = {
  getList(query: WishlistQuery = {}, signal?: AbortSignal): Promise<WishlistPage> {
    return httpRequest<WishlistPage>({
      path: '/api/wishlist',
      query: {
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
      },
      signal,
    })
  },

  getById(id: number, signal?: AbortSignal): Promise<WishlistItem> {
    return httpRequest<WishlistItem>({ path: `/api/wishlist/${id}`, signal })
  },

  add(
    payload: CreateWishlistItemRequest,
    signal?: AbortSignal,
  ): Promise<WishlistItem> {
    return httpRequest<WishlistItem>({
      path: '/api/wishlist',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  update(
    id: number,
    payload: UpdateWishlistItemRequest,
    signal?: AbortSignal,
  ): Promise<WishlistItem> {
    return httpRequest<WishlistItem>({
      path: `/api/wishlist/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/wishlist/${id}`,
      method: 'DELETE',
      signal,
    })
  },
}
