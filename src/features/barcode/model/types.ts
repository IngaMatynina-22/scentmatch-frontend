import type { Perfume } from '@/entities/perfume'

export const BARCODE_STATUSES = {
  found: 'found',
  notFound: 'notFound',
  ambiguous: 'ambiguous',
} as const

export type BarcodeLookupResult = {
  status: string
  perfume: Perfume | null
  matches: Perfume[]
}
