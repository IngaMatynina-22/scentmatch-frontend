import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { loginPathWithReturn } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, sessionError, retrySessionRestore } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <PageContainer title="Сесія">
        <LoadingState label="Перевірка авторизації…" />
      </PageContainer>
    )
  }

  if (sessionError && !isAuthenticated) {
    return (
      <PageContainer title="Сесія">
        <ErrorState
          title="Не вдалося перевірити сесію"
          message={sessionError}
          action={
            <Button type="button" variant="ghost" onClick={() => void retrySessionRestore()}>
              Повторити
            </Button>
          }
        />
      </PageContainer>
    )
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={loginPathWithReturn(returnTo)} replace state={{ from: location }} />
  }

  return <Outlet />
}
