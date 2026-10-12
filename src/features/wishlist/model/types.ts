import type { Perfume } from '@/entities/perfume'
import type { PagedResult } from '@/shared/api/paging'

export const WISHLIST_STATUSES = [
  'Wanted',
  'Watching',
  'Purchased',
  'Archived',
] as const

export const WISHLIST_STATUS_LABELS: Record<string, string> = {
  Wanted: 'Бажаний',
  Watching: 'Спостерігаю',
  Purchased: 'Придбано',
  Archived: 'Архів',
}

export type WishlistItem = {
  id: number
  perfumeId: number
  perfume: Perfume | null
  status: string
  targetPrice: number | null
  currency: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  purchasedAt: string | null
}

export type CreateWishlistItemRequest = {
  perfumeId: number
  status?: string | null
  targetPrice?: number | null
  currency?: string | null
  note?: string | null
}

export type UpdateWishlistItemRequest = {
  status: string
  targetPrice?: number | null
  currency?: string | null
  note?: string | null
}

export type WishlistQuery = {
  page?: number
  pageSize?: number
  status?: string
}

export type WishlistPage = PagedResult<WishlistItem>
