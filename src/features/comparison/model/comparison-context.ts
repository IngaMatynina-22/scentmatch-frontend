import { createContext } from 'react'
import type {
  AddToComparisonResult,
  CompareSelectionItem,
} from '@/features/comparison/model/types'

export type ComparisonContextValue = {
  items: CompareSelectionItem[]
  count: number
  isSelected: (perfumeId: number) => boolean
  canAddMore: boolean
  add: (item: CompareSelectionItem) => AddToComparisonResult
  remove: (perfumeId: number) => void
  clear: () => void
}

export const ComparisonContext = createContext<ComparisonContextValue | null>(null)
