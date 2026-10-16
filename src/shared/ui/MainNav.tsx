import { useEffect, useId, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useComparison } from '@/features/comparison'
import { useNotifications } from '@/features/notifications'
import { ROUTES } from '@/shared/constants/routes'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { IconButton } from '@/shared/ui/IconButton'
import styles from './MainNav.module.css'

const publicLinks = [
  { to: ROUTES.catalog, label: 'Каталог' },
  { to: ROUTES.barcode, label: 'Штрихкод' },
  { to: ROUTES.compare, label: 'Порівняння' },
  { to: ROUTES.matchGift, label: 'Подарунок' },
] as const

const authLinks = [
  { to: ROUTES.match, label: 'Підбір' },
  { to: ROUTES.recommendations, label: 'Рекомендації' },
  { to: ROUTES.analytics, label: 'Аналітика' },
  { to: ROUTES.favorites, label: 'Обране' },
  { to: ROUTES.collections, label: 'Колекції' },
  { to: ROUTES.wardrobe, label: 'Гардероб' },
  { to: ROUTES.wishlist, label: 'Wishlist' },
  { to: ROUTES.journal, label: 'Щоденник' },
  { to: ROUTES.blindComparison, label: 'Сліпе' },
  { to: ROUTES.history, label: 'Історія' },
  { to: ROUTES.notifications, label: 'Сповіщення' },
  { to: ROUTES.profile, label: 'Профіль' },
] as const

export function MainNav() {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuLocationKey, setMenuLocationKey] = useState(location.key)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuId = useId()
  const { count: compareCount } = useComparison()
  const { unreadCount } = useNotifications()

  if (location.key !== menuLocationKey) {
    setMenuLocationKey(location.key)
    setOpen(false)
  }

  useEffect(() => {
    const desktopNav = document.querySelector(
      'nav[aria-label="Основна навігація"]',
    ) as HTMLElement | null
    const pinned = document.querySelector(
      '[data-nav-pinned="true"]',
    ) as HTMLElement | null
    // #region agent log
    fetch('http://127.0.0.1:7646/ingest/a93378d8-d876-4c8d-aacd-a4cfef8f0ff5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'66d254'},body:JSON.stringify({sessionId:'66d254',runId:'post-fix',hypothesisId:'G',location:'MainNav.tsx:pinned-outside-scroll',message:'Pinned admin/logout outside scroll',data:{isAuthenticated,isAdmin,path:location.pathname,pageOverflows:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,navScrollWidth:desktopNav?.scrollWidth??null,navClientWidth:desktopNav?.clientWidth??null,navOverflows:desktopNav?desktopNav.scrollWidth>desktopNav.clientWidth:null,pinnedExists:Boolean(pinned),pinnedText:pinned?.textContent?.replace(/\s+/g,' ').trim().slice(0,80)??null,adminInsideScroll:Boolean(desktopNav?.textContent?.includes('Адмін')),logoutInsideScroll:Boolean(desktopNav?.textContent?.includes('Вийти'))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [isAuthenticated, isAdmin, isLoading, open, location.pathname])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      navigate(ROUTES.home, { replace: true })
    } finally {
      setLoggingOut(false)
      setOpen(false)
    }
  }

  const scrollLinks = (
    <>
      {publicLinks.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {link.label}
            {link.to === ROUTES.compare && compareCount > 0 ? (
              <Badge tone="accent">{compareCount}</Badge>
            ) : null}
          </NavLink>
        </li>
      ))}

      {isLoading ? (
        <li>
          <span className={styles.linkMuted}>Сесія…</span>
        </li>
      ) : null}

      {!isLoading && isAuthenticated
        ? authLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {link.label}
                {link.to === ROUTES.notifications && unreadCount > 0 ? (
                  <Badge tone="accent">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                ) : null}
              </NavLink>
            </li>
          ))
        : null}

      {!isLoading && !isAuthenticated ? (
        <>
          <li className={styles.loginItem}>
            <ButtonLink to={ROUTES.login} size="sm" variant="ghost">
              Увійти
            </ButtonLink>
          </li>
          <li className={styles.loginItem}>
            <ButtonLink to={ROUTES.register} size="sm">
              Реєстрація
            </ButtonLink>
          </li>
        </>
      ) : null}
    </>
  )

  const adminItem =
    !isLoading && isAdmin ? (
      <li>
        <NavLink
          to={ROUTES.admin.perfumes}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Адмін
        </NavLink>
      </li>
    ) : null

  const logoutItem =
    !isLoading && isAuthenticated ? (
      <li className={styles.loginItem}>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loading={loggingOut}
          onClick={() => void handleLogout()}
          aria-label={user ? `Вийти (${user.username})` : 'Вийти'}
        >
          Вийти
        </Button>
      </li>
    ) : null

  const showPinned = Boolean(adminItem || logoutItem)

  return (
    <div className={styles.root}>
      <div className={styles.desktopRow}>
        <nav className={styles.desktop} aria-label="Основна навігація">
          <ul className={styles.list}>{scrollLinks}</ul>
        </nav>

        {showPinned ? (
          <ul className={styles.pinned} data-nav-pinned="true">
            {adminItem}
            {logoutItem}
          </ul>
        ) : null}
      </div>

      <div className={styles.mobile}>
        <IconButton
          label={open ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </IconButton>

        {open ? (
          <nav id={menuId} className={styles.drawer} aria-label="Мобільна навігація">
            <ul className={styles.drawerList}>
              {scrollLinks}
              {adminItem}
              {logoutItem}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
