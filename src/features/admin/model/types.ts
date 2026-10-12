import type { Perfume, PerfumeCharacteristics } from '@/entities/perfume'

export type BrandWritePayload = {
  name: string
  description: string | null
  country: string | null
  website: string | null
  logoUrl: string | null
}

export type NoteWritePayload = {
  name: string
  description: string | null
  category: string | null
}

export type SeasonWritePayload = {
  name: string
  description: string | null
}

export type FragranceTypeWritePayload = {
  name: string
  description: string | null
}

export type PerfumeNoteInput = {
  noteId: number
  noteType: string
}

export type PerfumeSeasonInput = {
  seasonId: number
  suitability: number
}

export type PerfumeShopLinkInput = {
  storeName: string
  url: string
}

export type PerfumeWritePayload = {
  name: string
  brandId: number
  fragranceTypeId: number
  description: string | null
  releaseYear: number | null
  concentration: string | null
  gender: string | null
  price: number | null
  imageUrl: string | null
  characteristics: PerfumeCharacteristics | null
  notes: PerfumeNoteInput[]
  seasons: PerfumeSeasonInput[]
  shopLinks: PerfumeShopLinkInput[]
}

export type AdminReviewUser = {
  id: number
  username: string
  email: string
}

export type AdminReviewPerfume = {
  id: number
  name: string
}

export type AdminReview = {
  id: number
  user: AdminReviewUser
  perfume: AdminReviewPerfume
  rating: number
  text: string | null
  status: string
  createdAt: string | null
  updatedAt: string | null
}

export type AdminReviewQuery = {
  status?: string
  page?: number
  pageSize?: number
}

export type PerfumeDetails = Perfume

export const NOTE_TYPES = ['Top', 'Middle', 'Base'] as const
export const REVIEW_STATUSES = ['Pending', 'Approved', 'Rejected'] as const
