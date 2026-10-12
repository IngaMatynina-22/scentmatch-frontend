import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <p className={styles.text}>ScentMatch — персоналізований підбір парфумів</p>
      </div>
    </footer>
  )
}
