import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { loginPathWithReturn, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'

export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading, sessionError, retrySessionRestore } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <PageContainer title="Сесія">
        <LoadingState label="Перевірка доступу…" />
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

  if (!isAdmin) {
    return (
      <PageContainer title="Немає доступу">
        <ErrorState
          title="Потрібна роль Admin"
          message="Цей розділ доступний лише адміністраторам. Frontend-перевірка ролі не замінює захист API."
          action={<ButtonLink to={ROUTES.home}>На головну</ButtonLink>}
        />
      </PageContainer>
    )
  }

  return <Outlet />
}
