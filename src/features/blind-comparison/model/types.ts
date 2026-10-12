import type { Perfume } from '@/entities/perfume'

export type CreateBlindComparisonRequest = {
  perfumeIds: number[]
}

export type BlindComparisonSlot = {
  label: string
  sortOrder: number
  rating: number | null
  comment: string | null
}

export type BlindComparisonSession = {
  id: string
  status: string
  createdAt: string
  expiresAt: string
  completedAt: string | null
  winnerLabel: string | null
  slots: BlindComparisonSlot[]
}

export type BlindComparisonRatingItem = {
  label: string
  rating?: number | null
  comment?: string | null
}

export type BlindComparisonRatingsRequest = {
  ratings: BlindComparisonRatingItem[]
}

export type CompleteBlindComparisonRequest = {
  winnerLabel?: string | null
}

export type BlindComparisonRevealedSlot = {
  label: string
  sortOrder: number
  perfumeId: number
  perfume: Perfume | null
  rating: number | null
  comment: string | null
}

export type BlindComparisonResults = {
  id: string
  status: string
  winnerLabel: string | null
  createdAt: string
  expiresAt: string
  completedAt: string | null
  slots: BlindComparisonRevealedSlot[]
}
