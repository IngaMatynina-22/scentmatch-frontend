import { Navigate } from 'react-router-dom'
import { MatchingResults, readGiftMatchSession } from '@/features/matching'
import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './GiftMatchResultsPage.module.css'

export function GiftMatchResultsPage() {
  const snapshot = readGiftMatchSession()

  if (!snapshot) {
    return <Navigate to={ROUTES.matchGift} replace />
  }

  return (
    <PageContainer
      title="Результати подарунка"
      description="Повний список підібраних ароматів за вашими критеріями."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.matchGift} variant="ghost" size="sm">
          Назад до критеріїв
        </ButtonLink>
      </div>

      {snapshot.occasion ? (
        <p className={styles.occasion}>Привід: {snapshot.occasion}</p>
      ) : null}

      <MatchingResults items={snapshot.items} submitted />
    </PageContainer>
  )
}
