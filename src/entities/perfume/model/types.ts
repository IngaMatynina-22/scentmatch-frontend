/**
 * Types aligned with ScentMatch.Application.Catalog.DTOs
 * and Application.Reviews.DTOs (public approved reviews).
 */

export type NamedEntity = {
  id: number
  name: string
}

export type PerfumeCharacteristics = {
  sweetness: number | null
  freshness: number | null
  woody: number | null
  spicy: number | null
  citrus: number | null
  floral: number | null
  fruity: number | null
  powdery: number | null
  smoky: number | null
  oriental: number | null
}

export type PerfumeNote = {
  noteId: number
  name: string
  noteType: string
}

export type PerfumeSeason = {
  seasonId: number
  name: string
  suitability: number | null
}

/** PerfumeShopLinkDto */
export type PerfumeShopLink = {
  id: number
  storeName: string
  url: string
}

/** PerfumeListItemDto / PerfumeDetailsDto (details inherits list shape). */
export type Perfume = {
  id: number
  name: string
  brand: NamedEntity
  fragranceType: NamedEntity
  description: string | null
  releaseYear: number | null
  concentration: string | null
  gender: string | null
  price: number | null
  imageUrl: string | null
  rating: number
  reviewsCount: number
  characteristics: PerfumeCharacteristics
  notes: PerfumeNote[]
  seasons: PerfumeSeason[]
  shopLinks: PerfumeShopLink[]
}

export type Brand = {
  id: number
  name: string
  description: string | null
  country: string | null
  website: string | null
  logoUrl: string | null
}

export type Note = {
  id: number
  name: string
  description: string | null
  category: string | null
}

export type Season = {
  id: number
  name: string
  description: string | null
}

export type FragranceType = {
  id: number
  name: string
  description: string | null
}

export type ReviewUser = {
  id: number
  username: string
}

export type Review = {
  id: number
  user: ReviewUser
  rating: number
  text: string | null
  createdAt: string | null
  updatedAt: string | null
}

export const PERFUME_SORT_BY = [
  'name',
  'price',
  'rating',
  'releaseYear',
  'brand',
] as const

export type PerfumeSortBy = (typeof PERFUME_SORT_BY)[number]

export const SORT_ORDERS = ['asc', 'desc'] as const
export type SortOrder = (typeof SORT_ORDERS)[number]

export const REVIEW_SORT_BY = ['date', 'rating'] as const
export type ReviewSortBy = (typeof REVIEW_SORT_BY)[number]

/** Query params for GET /api/perfumes */
export type PerfumeQuery = {
  search?: string
  brandId?: number
  fragranceTypeId?: number
  seasonId?: number
  /** Comma-separated note IDs (AND semantics) */
  noteIds?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  gender?: string
  concentration?: string
  minSweetness?: number
  minFreshness?: number
  minWoody?: number
  minSpicy?: number
  sortBy?: PerfumeSortBy
  sortOrder?: SortOrder
  page?: number
  pageSize?: number
}

/** Query params for GET /api/perfumes/{id}/reviews */
export type ReviewQuery = {
  sortBy?: ReviewSortBy
  sortOrder?: SortOrder
  page?: number
  pageSize?: number
}
