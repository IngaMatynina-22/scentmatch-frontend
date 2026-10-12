import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import styles from './Layout.module.css'

export function AuthLayout() {
  return (
    <div className={`${styles.shell} ${styles.authShell}`}>
      <header className={styles.authHeader}>
        <Link to={ROUTES.home} className={styles.authBrand}>
          ScentMatch
        </Link>
        <ThemeToggle />
      </header>
      <main className={styles.authMain}>
        <Outlet />
      </main>
    </div>
  )
}
