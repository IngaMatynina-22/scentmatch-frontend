import { createContext } from 'react'

export type FavoritesContextValue = {
  favoriteIds: ReadonlySet<number>
  isFavorite: (perfumeId: number) => boolean
  isLoading: boolean
  isToggling: (perfumeId: number) => boolean
  error: string | null
  refresh: () => Promise<void>
  addFavorite: (perfumeId: number) => Promise<void>
  removeFavorite: (perfumeId: number) => Promise<void>
  toggleFavorite: (perfumeId: number) => Promise<void>
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)
