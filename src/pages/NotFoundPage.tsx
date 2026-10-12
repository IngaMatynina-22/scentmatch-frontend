import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { PageContainer } from '@/shared/ui/PageContainer'
import { ErrorState } from '@/shared/ui/ErrorState'

export function NotFoundPage() {
  return (
    <PageContainer title="Сторінку не знайдено">
      <ErrorState title="404" message="Запитаний маршрут не існує." />
      <p>
        <Link to={ROUTES.home}>На головну</Link>
      </p>
    </PageContainer>
  )
}
