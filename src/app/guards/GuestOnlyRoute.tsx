import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { ROUTES } from '@/shared/constants/routes'
import { getSafeInternalPath } from '@/shared/lib/safeReturnUrl'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'

export function GuestOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeInternalPath(searchParams.get('returnUrl'), ROUTES.home)

  if (isLoading) {
    return (
      <PageContainer title="Сесія">
        <LoadingState label="Перевірка сесії…" />
      </PageContainer>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
