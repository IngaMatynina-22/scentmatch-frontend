import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { favoritesApi } from '@/features/favorites/api/favoritesApi'
import { FavoritesContext } from '@/features/favorites/model/favorites-context'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'

const PAGE_SIZE = 100

async function fetchAllFavoriteIds(signal?: AbortSignal): Promise<Set<number>> {
  const ids = new Set<number>()
  let page = 1
  let totalPages = 1

  do {
    const result = await favoritesApi.getList({ page, pageSize: PAGE_SIZE }, signal)
    for (const item of result.items) {
      ids.add(item.id)
    }
    totalPages = Math.max(1, result.totalPages)
    page += 1
  } while (page <= totalPages)

  return ids
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setFavoriteIds(new Set())
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const ids = await fetchAllFavoriteIds(controller.signal)
        if (!controller.signal.aborted) {
          setFavoriteIds(ids)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setFavoriteIds(new Set())
        setError(getApiErrorMessage(err, 'Не вдалося завантажити обране.'))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [isAuthenticated, authLoading, reloadToken])

  function isFavorite(perfumeId: number): boolean {
    return favoriteIds.has(perfumeId)
  }

  function isToggling(perfumeId: number): boolean {
    return pendingIds.has(perfumeId)
  }

  function markPending(perfumeId: number, pending: boolean) {
    setPendingIds((current) => {
      const next = new Set(current)
      if (pending) next.add(perfumeId)
      else next.delete(perfumeId)
      return next
    })
  }

  async function addFavorite(perfumeId: number) {
    if (!isAuthenticated || pendingIds.has(perfumeId) || favoriteIds.has(perfumeId)) {
      return
    }

    const previous = new Set(favoriteIds)
    setFavoriteIds(new Set(previous).add(perfumeId))
    markPending(perfumeId, true)
    setError(null)

    try {
      await favoritesApi.add(perfumeId)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CONFLICT') {
        setFavoriteIds(new Set(previous).add(perfumeId))
        return
      }
      setFavoriteIds(previous)
      setError(getApiErrorMessage(err, 'Не вдалося додати до обраного.'))
      throw err
    } finally {
      markPending(perfumeId, false)
    }
  }

  async function removeFavorite(perfumeId: number) {
    if (!isAuthenticated || pendingIds.has(perfumeId) || !favoriteIds.has(perfumeId)) {
      return
    }

    const previous = new Set(favoriteIds)
    const next = new Set(previous)
    next.delete(perfumeId)
    setFavoriteIds(next)
    markPending(perfumeId, true)
    setError(null)

    try {
      await favoritesApi.remove(perfumeId)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        setFavoriteIds(next)
        return
      }
      setFavoriteIds(previous)
      setError(getApiErrorMessage(err, 'Не вдалося прибрати з обраного.'))
      throw err
    } finally {
      markPending(perfumeId, false)
    }
  }

  async function toggleFavorite(perfumeId: number) {
    if (favoriteIds.has(perfumeId)) {
      await removeFavorite(perfumeId)
    } else {
      await addFavorite(perfumeId)
    }
  }

  async function refresh() {
    setReloadToken((value) => value + 1)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        isLoading,
        isToggling,
        error,
        refresh,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
