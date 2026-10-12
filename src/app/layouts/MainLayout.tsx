import { Outlet } from 'react-router-dom'
import { Footer } from '@/shared/ui/Footer'
import { Header } from '@/shared/ui/Header'
import styles from './Layout.module.css'

export function MainLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
