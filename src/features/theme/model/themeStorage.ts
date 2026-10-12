import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { THEMES, isTheme, type Theme } from '@/features/theme/model/types'

export const DEFAULT_THEME: Theme = THEMES.light

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.theme)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  } catch {
    // Storage may be unavailable (private mode); theme still applies in-memory.
  }
}

export function applyThemeToDocument(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? DEFAULT_THEME
}
