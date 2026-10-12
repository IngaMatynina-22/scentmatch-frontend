import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { ROUTES } from '@/shared/constants/routes'
import styles from './AdminNav.module.css'

const adminLinks = [
  { to: ROUTES.admin.dashboard, label: 'Dashboard' },
  { to: ROUTES.admin.perfumes, label: 'Парфуми' },
  { to: ROUTES.admin.brands, label: 'Бренди' },
  { to: ROUTES.admin.notes, label: 'Ноти' },
  { to: ROUTES.admin.seasons, label: 'Сезони' },
  { to: ROUTES.admin.types, label: 'Типи' },
  { to: ROUTES.admin.reviews, label: 'Відгуки' },
  { to: ROUTES.admin.catalogQuality, label: 'Якість' },
  { to: ROUTES.admin.duplicates, label: 'Дублікати' },
  { to: ROUTES.admin.catalogImport, label: 'Імпорт' },
  { to: ROUTES.admin.auditLogs, label: 'Audit' },
  { to: ROUTES.admin.jobs, label: 'Задачі' },
  { to: ROUTES.admin.integrations, label: 'Інтеграції' },
] as const

export function AdminNav() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <nav className={styles.nav} aria-label="Адмін навігація">
      <ul className={styles.list}>
        <li>
          <NavLink
            to={ROUTES.home}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            end
          >
            На сайт
          </NavLink>
        </li>
        {adminLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
        <li>
          <button type="button" className={styles.linkButton} onClick={() => void handleLogout()}>
            Вийти
          </button>
        </li>
      </ul>
    </nav>
  )
}
