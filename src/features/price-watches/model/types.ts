import type { PagedResult } from '@/shared/api/paging'

export type CreatePriceWatchRequest = {
  perfumeId: number
  targetPrice: number
  currency?: string
  shopLinkId?: number | null
  sourceUrl?: string | null
  sourceName?: string | null
}

export type UpdatePriceWatchRequest = {
  targetPrice?: number | null
  isActive?: boolean | null
  currency?: string | null
  shopLinkId?: number | null
  sourceUrl?: string | null
  sourceName?: string | null
}

export type PriceWatch = {
  id: number
  perfumeId: number
  perfumeName: string
  brandName: string | null
  shopLinkId: number | null
  sourceName: string | null
  sourceUrl: string | null
  currency: string
  targetPrice: number
  lastKnownPrice: number | null
  lastCheckedAt: string | null
  lastNotifiedAt: string | null
  lastNotifiedPrice: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PriceSnapshot = {
  id: number
  perfumeId: number
  priceWatchId: number | null
  sourceName: string
  sourceUrl: string | null
  currency: string
  price: number
  capturedAt: string
}

export type PriceWatchPage = PagedResult<PriceWatch>
