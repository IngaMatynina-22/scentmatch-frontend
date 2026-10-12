import { useState } from 'react'
import { wishlistApi } from '@/features/wishlist/api/wishlistApi'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { loginPathWithReturn, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'

type AddToWishlistButtonProps = {
  perfumeId: number
  size?: 'sm' | 'md'
}

export function AddToWishlistButton({
  perfumeId,
  size = 'md',
}: AddToWishlistButtonProps) {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tone, setTone] = useState<'success' | 'error' | 'info'>('info')

  if (!isAuthenticated) {
    return (
      <ButtonLink
        to={loginPathWithReturn(ROUTES.wishlist)}
        variant="ghost"
        size={size}
      >
        Wishlist
      </ButtonLink>
    )
  }

  async function handleAdd() {
    if (loading) return
    setLoading(true)
    setMessage(null)
    try {
      await wishlistApi.add({ perfumeId, status: 'Wanted' })
      setTone('success')
      setMessage('Додано до wishlist.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setTone('info')
        setMessage('Уже є у wishlist.')
      } else {
        setTone('error')
        setMessage(getApiErrorMessage(err, 'Не вдалося додати до wishlist.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem' }}>
      <Button
        type="button"
        variant="ghost"
        size={size}
        loading={loading}
        onClick={() => void handleAdd()}
      >
        У wishlist
      </Button>
      {message ? (
        <span
          role="status"
          style={{
            fontSize: 'var(--text-xs)',
            color:
              tone === 'error'
                ? 'var(--color-danger)'
                : tone === 'success'
                  ? 'var(--color-accent-hover)'
                  : 'var(--color-text-muted)',
          }}
        >
          {message}
        </span>
      ) : null}
    </span>
  )
}
