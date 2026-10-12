import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BARCODE_STATUSES, barcodeApi, type BarcodeLookupResult } from '@/features/barcode'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { perfumeDetailsPath, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './platform.module.css'

export function BarcodeSearchPage() {
  const [code, setCode] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BarcodeLookupResult | null>(null)

  async function handleSearch() {
    if (loading) return
    const trimmed = code.trim()
    if (!trimmed) {
      setFieldError('Введіть штрихкод.')
      return
    }
    if (!/^[0-9A-Za-z-]{4,64}$/.test(trimmed)) {
      setFieldError('Штрихкод: 4–64 символи (цифри, літери, дефіс).')
      return
    }

    setFieldError(null)
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const data = await barcodeApi.lookup(trimmed)
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося виконати пошук за штрихкодом.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title="Пошук за штрихкодом"
      description="Введіть штрихкод вручну. Сканування камерою можна додати пізніше на той самий API."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.catalog} variant="ghost" size="sm">
          Каталог
        </ButtonLink>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          void handleSearch()
        }}
      >
        <Input
          label="Штрихкод"
          value={code}
          error={fieldError ?? undefined}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          inputMode="numeric"
        />
        <Button type="submit" variant="accent" loading={loading}>
          Знайти
        </Button>
      </form>

      {loading ? <LoadingState label="Шукаємо…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка пошуку"
          message={error}
          onRetry={() => void handleSearch()}
        />
      ) : null}

      {!loading && !error && result?.status === BARCODE_STATUSES.notFound ? (
        <EmptyState
          title="Не знайдено"
          message="У каталозі немає парфуму з таким штрихкодом."
        />
      ) : null}

      {!loading &&
      !error &&
      result?.status === BARCODE_STATUSES.found &&
      result.perfume ? (
        <div className={styles.card}>
          <p className={styles.meta}>Знайдено</p>
          <Link
            to={perfumeDetailsPath(result.perfume.id)}
            className={styles.link}
          >
            {result.perfume.brand.name} — {result.perfume.name}
          </Link>
          <ButtonLink
            to={perfumeDetailsPath(result.perfume.id)}
            variant="accent"
            size="sm"
          >
            Відкрити картку
          </ButtonLink>
        </div>
      ) : null}

      {!loading &&
      !error &&
      result?.status === BARCODE_STATUSES.ambiguous ? (
        <div className={styles.card}>
          <p className={styles.meta}>Кілька збігів — уточніть вибір</p>
          <ul className={styles.list}>
            {(result.matches ?? []).map((perfume) => (
              <li key={perfume.id}>
                <Link to={perfumeDetailsPath(perfume.id)} className={styles.link}>
                  {perfume.brand.name} — {perfume.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </PageContainer>
  )
}
