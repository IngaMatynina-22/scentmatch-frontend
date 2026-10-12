import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type { CatalogDuplicateGroup } from '@/features/admin/model/platformTypes'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

export function AdminDuplicatesPage() {
  const [groups, setGroups] = useState<CatalogDuplicateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await adminPlatformApi.getDuplicates(controller.signal)
        if (!controller.signal.aborted) setGroups(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити дублікати.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reload])

  return (
    <PageContainer
      title="Потенційні дублікати"
      description="Перегляд схожих записів. Об’єднання/видалення автоматично не виконується."
    >
      {loading ? <LoadingState label="Завантаження…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && groups.length === 0 ? (
        <EmptyState title="Дублікатів не знайдено" message="Каталог у порядку." />
      ) : null}
      {!loading && !error
        ? groups.map((group) => (
            <section key={group.normalizedKey} className={styles.card}>
              <h2 className={styles.cardTitle}>{group.reason}</h2>
              <p className={styles.meta}>
                Ключ: {group.normalizedKey} · впевненість{' '}
                {new Intl.NumberFormat('uk-UA', {
                  maximumFractionDigits: 2,
                }).format(group.confidence)}
              </p>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.perfumeId} className={styles.actions}>
                    <span>
                      {item.brandName} — {item.name}
                      {item.barcode ? ` · ${item.barcode}` : ''}
                    </span>
                    <Link to={`${ROUTES.admin.perfumes}?edit=${item.perfumeId}`}>
                      Редагувати
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        : null}
    </PageContainer>
  )
}
