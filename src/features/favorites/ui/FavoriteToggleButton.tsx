import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useFavorites } from '@/features/favorites'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { loginPathWithReturn } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'

type FavoriteToggleButtonProps = {
  perfumeId: number
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export function FavoriteToggleButton({
  perfumeId,
  size = 'sm',
  fullWidth = false,
}: FavoriteToggleButtonProps) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, isToggling, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const [localError, setLocalError] = useState<string | null>(null)

  const favorite = isFavorite(perfumeId)
  const pending = isToggling(perfumeId)

  async function handleClick() {
    setLocalError(null)

    if (!isAuthenticated) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      navigate(loginPathWithReturn(returnTo))
      return
    }

    try {
      await toggleFavorite(perfumeId)
    } catch (error) {
      setLocalError(getApiErrorMessage(error, 'Не вдалося оновити обране.'))
    }
  }

  return (
    <div style={fullWidth ? { width: '100%' } : undefined}>
      <Button
        type="button"
        size={size}
        variant={favorite ? 'ghost' : 'primary'}
        fullWidth={fullWidth}
        loading={pending}
        disabled={pending}
        aria-pressed={isAuthenticated ? favorite : undefined}
        onClick={() => void handleClick()}
      >
        {!isAuthenticated
          ? 'В обране'
          : favorite
            ? 'В обраному'
            : 'В обране'}
      </Button>
      {localError ? (
        <p
          style={{
            margin: '0.35rem 0 0',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger)',
          }}
        >
          {localError}
        </p>
      ) : null}
    </div>
  )
}
