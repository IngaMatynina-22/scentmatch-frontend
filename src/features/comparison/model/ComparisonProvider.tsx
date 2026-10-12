import { useState, type ReactNode } from 'react'
import {
  COMPARE_MAX_ITEMS,
} from '@/features/comparison/model/constants'
import { ComparisonContext } from '@/features/comparison/model/comparison-context'
import {
  clearCompareSelectionStorage,
  readCompareSelection,
  writeCompareSelection,
} from '@/features/comparison/model/comparisonStorage'
import type {
  AddToComparisonResult,
  CompareSelectionItem,
} from '@/features/comparison/model/types'

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareSelectionItem[]>(() =>
    readCompareSelection(),
  )

  function persist(next: CompareSelectionItem[]) {
    setItems(next)
    writeCompareSelection(next)
  }

  function isSelected(perfumeId: number): boolean {
    return items.some((item) => item.id === perfumeId)
  }

  function add(item: CompareSelectionItem): AddToComparisonResult {
    if (!Number.isFinite(item.id) || item.id <= 0) {
      return { ok: false, reason: 'invalid' }
    }
    if (isSelected(item.id)) {
      return { ok: false, reason: 'duplicate' }
    }
    if (items.length >= COMPARE_MAX_ITEMS) {
      return { ok: false, reason: 'limit' }
    }

    persist([
      ...items,
      {
        id: item.id,
        name: item.name.trim() || `Парфум #${item.id}`,
        brandName: item.brandName.trim(),
      },
    ])
    return { ok: true }
  }

  function remove(perfumeId: number) {
    persist(items.filter((item) => item.id !== perfumeId))
  }

  function clear() {
    setItems([])
    clearCompareSelectionStorage()
  }

  return (
    <ComparisonContext.Provider
      value={{
        items,
        count: items.length,
        isSelected,
        canAddMore: items.length < COMPARE_MAX_ITEMS,
        add,
        remove,
        clear,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}
