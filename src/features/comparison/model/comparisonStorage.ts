import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { CompareSelectionItem } from '@/features/comparison/model/types'
import { COMPARE_MAX_ITEMS } from '@/features/comparison/model/constants'

function isSelectionItem(value: unknown): value is CompareSelectionItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'number' &&
    Number.isFinite(item.id) &&
    item.id > 0 &&
    typeof item.name === 'string' &&
    typeof item.brandName === 'string'
  )
}

export function readCompareSelection(): CompareSelectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.compareSelection)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seen = new Set<number>()
    const items: CompareSelectionItem[] = []

    for (const entry of parsed) {
      if (!isSelectionItem(entry) || seen.has(entry.id)) continue
      seen.add(entry.id)
      items.push({
        id: entry.id,
        name: entry.name,
        brandName: entry.brandName,
      })
      if (items.length >= COMPARE_MAX_ITEMS) break
    }

    return items
  } catch {
    return []
  }
}

export function writeCompareSelection(items: CompareSelectionItem[]): void {
  localStorage.setItem(STORAGE_KEYS.compareSelection, JSON.stringify(items))
}

export function clearCompareSelectionStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.compareSelection)
}
