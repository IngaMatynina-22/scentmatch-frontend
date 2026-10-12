import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  WISHLIST_STATUS_LABELS,
  WISHLIST_STATUSES,
  wishlistApi,
  type WishlistItem,
} from '@/features/wishlist'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { perfumeDetailsPath, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Select } from '@/shared/ui/Select'
import styles from './platform.module.css'

function statusLabel(status: string): string {
  return WISHLIST_STATUS_LABELS[status] ?? status
}

export function WishlistPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<PagedResult<WishlistItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  const [perfumeId, setPerfumeId] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [note, setNote] = useState('')
  const [addStatus, setAddStatus] = useState('Wanted')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editing, setEditing] = useState<WishlistItem | null>(null)
  const [editStatus, setEditStatus] = useState('Wanted')
  const [editPrice, setEditPrice] = useState('')
  const [editCurrency, setEditCurrency] = useState('EUR')
  const [editNote, setEditNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await wishlistApi.getList(
          { page, pageSize: 20, status: status || undefined },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити wishlist.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, status, reload])

  async function handleAdd() {
    if (adding) return
    const id = Number.parseInt(perfumeId, 10)
    if (!Number.isFinite(id) || id <= 0) {
      setFormError('Вкажіть коректний ID парфуму.')
      return
    }
    setAdding(true)
    setFormError(null)
    setSuccess(null)
    try {
      await wishlistApi.add({
        perfumeId: id,
        status: addStatus,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        currency: currency.trim() || null,
        note: note.trim() || null,
      })
      setSuccess('Додано до wishlist.')
      setPerfumeId('')
      setTargetPrice('')
      setNote('')
      setReload((v) => v + 1)
    } catch (err) {
      const fields = getFieldErrors(err)
      setFormError(
        fields.perfumeId ||
          getApiErrorMessage(err, 'Не вдалося додати. Можливо, аромат уже в списку.'),
      )
    } finally {
      setAdding(false)
    }
  }

  async function handleSaveEdit() {
    if (!editing || saving) return
    setSaving(true)
    try {
      await wishlistApi.update(editing.id, {
        status: editStatus,
        targetPrice: editPrice ? Number(editPrice) : null,
        currency: editCurrency.trim() || null,
        note: editNote.trim() || null,
      })
      setEditing(null)
      setReload((v) => v + 1)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Не вдалося оновити запис.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Видалити з wishlist?')) return
    try {
      await wishlistApi.remove(id)
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося видалити.'))
    }
  }

  return (
    <PageContainer
      title="Wishlist"
      description="Список потенційних покупок. Не плутайте з обраним — тут саме плани купівлі."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.favorites} variant="ghost" size="sm">
          Обране
        </ButtonLink>
        <ButtonLink to={ROUTES.priceWatches} variant="ghost" size="sm">
          Ціни
        </ButtonLink>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          void handleAdd()
        }}
      >
        <h2 className={styles.cardTitle}>Додати аромат</h2>
        <div className={styles.grid}>
          <Input
            label="ID парфуму"
            value={perfumeId}
            onChange={(e) => setPerfumeId(e.target.value)}
          />
          <Select
            label="Статус"
            value={addStatus}
            options={WISHLIST_STATUSES.map((s) => ({
              value: s,
              label: statusLabel(s),
            }))}
            onChange={(e) => setAddStatus(e.target.value)}
          />
          <Input
            label="Бажана ціна"
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
        <Input
          label="Нотатка"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        <Button type="submit" variant="accent" loading={adding}>
          Додати
        </Button>
      </form>

      <div className={styles.filters}>
        <Select
          label="Фільтр статусу"
          value={status}
          placeholder="Усі"
          options={[
            { value: '', label: 'Усі' },
            ...WISHLIST_STATUSES.map((s) => ({
              value: s,
              label: statusLabel(s),
            })),
          ]}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {editing ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSaveEdit()
          }}
        >
          <h2 className={styles.cardTitle}>Редагування</h2>
          <div className={styles.grid}>
            <Select
              label="Статус"
              value={editStatus}
              options={WISHLIST_STATUSES.map((s) => ({
                value: s,
                label: statusLabel(s),
              }))}
              onChange={(e) => setEditStatus(e.target.value)}
            />
            <Input
              label="Бажана ціна"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
            <Input
              label="Валюта"
              value={editCurrency}
              onChange={(e) => setEditCurrency(e.target.value)}
            />
          </div>
          <Input
            label="Нотатка"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
          />
          <div className={styles.actions}>
            <Button type="submit" variant="accent" loading={saving}>
              Зберегти
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
            >
              Скасувати
            </Button>
          </div>
        </form>
      ) : null}

      {loading ? <LoadingState label="Завантаження wishlist…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState
          title="Список порожній"
          message="Додайте аромат, який плануєте придбати."
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
                  {item.perfume?.name ?? `Парфум #${item.perfumeId}`}
                </Link>
                <p className={styles.meta}>
                  {statusLabel(item.status)}
                  {item.targetPrice != null
                    ? ` · ціль ${item.targetPrice} ${item.currency ?? ''}`
                    : ''}
                </p>
                {item.note ? <p className={styles.meta}>{item.note}</p> : null}
                <div className={styles.actions}>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(item)
                      setEditStatus(item.status)
                      setEditPrice(
                        item.targetPrice != null ? String(item.targetPrice) : '',
                      )
                      setEditCurrency(item.currency ?? 'EUR')
                      setEditNote(item.note ?? '')
                    }}
                  >
                    Редагувати
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
