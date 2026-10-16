import type { GiftMatchingRequest, MatchingResult } from '@/features/matching/model/types'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const GIFT_PREVIEW_COUNT = 3

export type GiftMatchSessionSnapshot = {
  items: MatchingResult[]
  occasion: string | null
  request: GiftMatchingRequest
  createdAt: number
}

export function saveGiftMatchSession(snapshot: GiftMatchSessionSnapshot): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.giftMatchSession, JSON.stringify(snapshot))
  } catch {
    // Ignore quota / private-mode failures; preview still works in-memory.
  }
}

export function readGiftMatchSession(): GiftMatchSessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.giftMatchSession)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GiftMatchSessionSnapshot
    if (!parsed || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearGiftMatchSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.giftMatchSession)
  } catch {
    // no-op
  }
}
