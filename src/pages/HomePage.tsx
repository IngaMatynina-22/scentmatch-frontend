import { useEffect, useRef } from 'react'
import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import styles from './HomePage.module.css'

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const measure = () => {
      const heroRect = hero.getBoundingClientRect()
      const shell = document.querySelector('[class*="shell"]')
      const header = document.querySelector('header')
      const navList = document.querySelector('nav[aria-label="Основна навігація"] ul')
      const adminShell = document.querySelector('[class*="adminHeader"]')
      // #region agent log
      const desktopNav = document.querySelector(
        'nav[aria-label="Основна навігація"]',
      ) as HTMLElement | null
      fetch('http://127.0.0.1:7646/ingest/a93378d8-d876-4c8d-aacd-a4cfef8f0ff5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'66d254'},body:JSON.stringify({sessionId:'66d254',runId:'post-fix',hypothesisId:'A,B',location:'HomePage.tsx:measure',message:'Home layout metrics after nav constrain',data:{innerWidth:window.innerWidth,docScrollWidth:document.documentElement.scrollWidth,docClientWidth:document.documentElement.clientWidth,pageOverflows:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,heroWidth:Math.round(heroRect.width),heroRight:Math.round(heroRect.right),overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth,shellWidth:shell?Math.round(shell.getBoundingClientRect().width):null,headerWidth:header?Math.round(header.getBoundingClientRect().width):null,navListScrollWidth:navList?Math.round((navList as HTMLElement).scrollWidth):null,navDesktopClientWidth:desktopNav?Math.round(desktopNav.clientWidth):null,navDesktopScrollWidth:desktopNav?Math.round(desktopNav.scrollWidth):null,navOverflows:desktopNav?desktopNav.scrollWidth>desktopNav.clientWidth:null,navLinkCount:navList?navList.querySelectorAll('a,button').length:null,hasAdminHeader:Boolean(adminShell),path:window.location.pathname},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby="home-brand">
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
