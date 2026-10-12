import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { MainNav } from '@/shared/ui/MainNav'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link to={ROUTES.home} className={styles.brand}>
          ScentMatch
        </Link>
        <div className={styles.actions}>
          <ThemeToggle />
          <MainNav />
        </div>
      </div>
    </header>
  )
}
