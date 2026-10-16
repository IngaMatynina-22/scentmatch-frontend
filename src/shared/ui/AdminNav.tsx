import { useEffect, useRef } from 'react'
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
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    // #region agent log
    fetch('http://127.0.0.1:7646/ingest/a93378d8-d876-4c8d-aacd-a4cfef8f0ff5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'66d254'},body:JSON.stringify({sessionId:'66d254',runId:'pre-fix',hypothesisId:'F',location:'AdminNav.tsx:overflow',message:'AdminNav overflow metrics',data:{scrollWidth:nav.scrollWidth,clientWidth:nav.clientWidth,overflows:nav.scrollWidth>nav.clientWidth,innerWidth:window.innerWidth,path:window.location.pathname},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [])

  async function handleLogout() {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Адмін навігація">
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
