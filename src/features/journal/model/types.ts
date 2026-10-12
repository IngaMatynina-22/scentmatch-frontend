import type { Perfume } from '@/entities/perfume'
import type { PagedResult } from '@/shared/api/paging'

/** JournalEntryDto — Perfume may be list-shaped subset */
export type JournalEntry = {
  id: number
  perfumeId: number
  perfume: Perfume | null
  testedOn: string
  rating: number
  notes: string | null
  wearMinutes: number | null
  openingImpression: string | null
  heartImpression: string | null
  baseImpression: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type CreateJournalEntryRequest = {
  perfumeId: number
  testedOn: string
  rating: number
  notes?: string | null
  wearMinutes?: number | null
  openingImpression?: string | null
  heartImpression?: string | null
  baseImpression?: string | null
  tags?: string[]
}

export type UpdateJournalEntryRequest = {
  testedOn: string
  rating: number
  notes?: string | null
  wearMinutes?: number | null
  openingImpression?: string | null
  heartImpression?: string | null
  baseImpression?: string | null
  tags?: string[]
}

export type JournalQuery = {
  page?: number
  pageSize?: number
  perfumeId?: number
  rating?: number
  from?: string
  to?: string
}

export type JournalPage = PagedResult<JournalEntry>
