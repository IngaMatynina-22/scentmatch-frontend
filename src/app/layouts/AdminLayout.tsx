import { Outlet } from 'react-router-dom'
import { AdminNav } from '@/shared/ui/AdminNav'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import styles from './Layout.module.css'

export function AdminLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderInner}>
          <div className={styles.adminHeaderTop}>
            <p className={styles.adminTitle}>ScentMatch Admin</p>
            <ThemeToggle />
          </div>
          <AdminNav />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
