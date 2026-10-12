import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.hero} aria-labelledby="home-brand">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.inner}>
        <p id="home-brand" className={`${styles.brand} motion-rise`}>
          ScentMatch
        </p>
        <h1 className={`${styles.headline} motion-rise-delay`}>
          Знайдіть аромат, який пасує саме вам
        </h1>
        <p className={`${styles.lead} motion-rise-delay`}>
          Персоналізований підбір і порівняння парфумів за нотами, характером і сезонністю.
        </p>
        <div className={`${styles.actions} motion-rise-delay`}>
          <ButtonLink to={ROUTES.catalog} variant="accent">
            До каталогу
          </ButtonLink>
          <ButtonLink to={ROUTES.compare} variant="ghost" className={styles.ghostOnDark}>
            Порівняти
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
