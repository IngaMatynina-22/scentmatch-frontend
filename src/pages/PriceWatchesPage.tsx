import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  priceWatchesApi,
  type PriceSnapshot,
  type PriceWatch,
} from '@/features/price-watches'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { perfumeDetailsPath, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './platform.module.css'

export function PriceWatchesPage() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<PriceWatch> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [providerHint, setProviderHint] = useState<string | null>(null)

  const [perfumeId, setPerfumeId] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [historyId, setHistoryId] = useState<number | null>(null)
  const [history, setHistory] = useState<PriceSnapshot[] | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await priceWatchesApi.getList(
          { page, pageSize: 20 },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(
          getApiErrorMessage(err, 'Не вдалося завантажити підписки на ціни.'),
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, reload])

  async function handleCreate() {
    if (creating) return
    const id = Number.parseInt(perfumeId, 10)
    const price = Number(targetPrice)
    if (!Number.isFinite(id) || id <= 0) {
      setFormError('Вкажіть коректний ID парфуму.')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Вкажіть цільову ціну.')
      return
    }
    setCreating(true)
    setFormError(null)
    setSuccess(null)
    setProviderHint(null)
    try {
      const created = await priceWatchesApi.create({
        perfumeId: id,
        targetPrice: price,
        currency: currency.trim() || 'EUR',
      })
      setSuccess('Підписку створено.')
      if (created.lastKnownPrice == null && created.lastCheckedAt == null) {
        setProviderHint(
          'Автоматичне відстеження цін залежить від налаштованого провайдера на сервері. Поки провайдер не налаштований, підписка зберігається, але перевірки можуть бути недоступні.',
        )
      }
      setPerfumeId('')
      setTargetPrice('')
      setReload((v) => v + 1)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Не вдалося створити підписку.')
      setFormError(message)
      if (/provider|not configured|не налашт/i.test(message)) {
        setProviderHint(
          'Провайдер цін на сервері не налаштований. Автоматичні перевірки недоступні.',
        )
      }
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(item: PriceWatch) {
    try {
      await priceWatchesApi.update(item.id, { isActive: !item.isActive })
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося змінити статус.'))
    }
  }

  async function updateTarget(item: PriceWatch, next: string) {
    const price = Number(next)
    if (!Number.isFinite(price) || price <= 0) return
    try {
      await priceWatchesApi.update(item.id, { targetPrice: price })
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося оновити ціну.'))
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Видалити підписку?')) return
    try {
      await priceWatchesApi.remove(id)
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося видалити підписку.'))
    }
  }

  async function loadHistory(id: number) {
    setHistoryId(id)
    setHistory(null)
    setHistoryError(null)
    try {
      const data = await priceWatchesApi.getHistory(id)
      setHistory(data)
      if (data.length === 0) {
        setHistoryError(
          'Історії цін ще немає. Якщо провайдер не налаштований, знімки не з’являться.',
        )
      }
    } catch (err) {
      setHistoryError(getApiErrorMessage(err, 'Не вдалося завантажити історію.'))
    }
  }

  return (
    <PageContainer
      title="Відстеження цін"
      description="Підписки на бажану ціну. Перевірку виконує backend — frontend не симулює ціни."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.wishlist} variant="ghost" size="sm">
          Wishlist
        </ButtonLink>
      </div>

      <p className={styles.notice} role="note">
        Якщо price provider не налаштований на сервері, автоматичні перевірки
        недоступні. Ми не показуємо вигадані ціни чи успішні перевірки.
      </p>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          void handleCreate()
        }}
      >
        <h2 className={styles.cardTitle}>Нова підписка</h2>
        <div className={styles.grid}>
          <Input
            label="ID парфуму"
            value={perfumeId}
            onChange={(e) => setPerfumeId(e.target.value)}
          />
          <Input
            label="Цільова ціна"
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
          <Input
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        {providerHint ? <p className={styles.notice}>{providerHint}</p> : null}
        <Button type="submit" variant="accent" loading={creating}>
          Створити
        </Button>
      </form>

      {loading ? <LoadingState label="Завантаження підписок…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState
          title="Немає підписок"
          message="Створіть підписку на бажану ціну для парфуму."
        />
      ) : null}

      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {result.items.map((item) => (
              <li key={item.id} className={styles.card}>
                <Link
                  to={perfumeDetailsPath(item.perfumeId)}
                  className={styles.link}
                >
                  {item.brandName ? `${item.brandName} — ` : ''}
                  {item.perfumeName}
                </Link>
                <p className={styles.meta}>
                  Ціль: {item.targetPrice} {item.currency} ·{' '}
                  {item.isActive ? 'активна' : 'призупинена'}
                </p>
                <p className={styles.meta}>
                  Остання відома ціна:{' '}
                  {item.lastKnownPrice != null
                    ? `${item.lastKnownPrice} ${item.currency}`
                    : 'немає даних'}
                  {item.lastCheckedAt
                    ? ` · перевірка ${new Date(item.lastCheckedAt).toLocaleString('uk-UA')}`
                    : ' · перевірок ще не було'}
                </p>
                <div className={styles.actions}>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void toggleActive(item)}
                  >
                    {item.isActive ? 'Призупинити' : 'Відновити'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const next = window.prompt(
                        'Нова цільова ціна',
                        String(item.targetPrice),
                      )
                      if (next) void updateTarget(item, next)
                    }}
                  >
                    Змінити ціну
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void loadHistory(item.id)}
                  >
                    Історія
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => void handleDelete(item.id)}
                  >
                    Видалити
                  </Button>
                </div>
                {historyId === item.id ? (
                  <div>
                    {historyError ? (
                      <p className={styles.meta}>{historyError}</p>
                    ) : null}
                    {history && history.length > 0 ? (
                      <ul className={styles.list}>
                        {history.map((snap) => (
                          <li key={snap.id} className={styles.meta}>
                            {new Date(snap.capturedAt).toLocaleString('uk-UA')}:{' '}
                            {snap.price} {snap.currency} ({snap.sourceName})
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <CatalogPagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
