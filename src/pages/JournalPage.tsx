import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  journalApi,
  type CreateJournalEntryRequest,
  type JournalEntry,
} from '@/features/journal'
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
import styles from './platform.module.css'

const PAGE_SIZE = 10

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function excerpt(text: string | null, max = 120): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function JournalPage() {
  const [searchParams] = useSearchParams()
  const perfumeFromQuery = searchParams.get('perfumeId')
  const initialPerfumeId = perfumeFromQuery ?? ''

  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<JournalEntry> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  const [filterPerfumeId, setFilterPerfumeId] = useState(initialPerfumeId)
  const [filterRating, setFilterRating] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const [showForm, setShowForm] = useState(Boolean(initialPerfumeId))
  const [editingId, setEditingId] = useState<number | null>(null)
  const [perfumeId, setPerfumeId] = useState(initialPerfumeId)
  const [testedOn, setTestedOn] = useState(todayIso())
  const [rating, setRating] = useState('7')
  const [notes, setNotes] = useState('')
  const [opening, setOpening] = useState('')
  const [heart, setHeart] = useState('')
  const [base, setBase] = useState('')
  const [wearMinutes, setWearMinutes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      perfumeId: filterPerfumeId ? Number.parseInt(filterPerfumeId, 10) : undefined,
      rating: filterRating ? Number.parseInt(filterRating, 10) : undefined,
      from: filterFrom || undefined,
      to: filterTo || undefined,
    }),
    [page, filterPerfumeId, filterRating, filterFrom, filterTo],
  )

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await journalApi.getList(query, controller.signal)
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити щоденник.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [query, reload])

  function resetForm() {
    setEditingId(null)
    setPerfumeId(initialPerfumeId || '')
    setTestedOn(todayIso())
    setRating('7')
    setNotes('')
    setOpening('')
    setHeart('')
    setBase('')
    setWearMinutes('')
    setFieldErrors({})
    setFormError(null)
  }

  function startEdit(entry: JournalEntry) {
    setShowForm(true)
    setEditingId(entry.id)
    setPerfumeId(String(entry.perfumeId))
    setTestedOn(entry.testedOn.slice(0, 10))
    setRating(String(entry.rating))
    setNotes(entry.notes ?? '')
    setOpening(entry.openingImpression ?? '')
    setHeart(entry.heartImpression ?? '')
    setBase(entry.baseImpression ?? '')
    setWearMinutes(entry.wearMinutes != null ? String(entry.wearMinutes) : '')
    setFieldErrors({})
    setFormError(null)
    setSuccess(null)
  }

  async function handleSave() {
    if (saving) return
    const errors: Record<string, string> = {}
    const perfumeIdNum = Number.parseInt(perfumeId, 10)
    const ratingNum = Number.parseInt(rating, 10)
    if (!editingId && (!Number.isFinite(perfumeIdNum) || perfumeIdNum <= 0)) {
      errors.perfumeId = 'Вкажіть коректний ID парфуму.'
    }
    if (!testedOn) errors.testedOn = 'Дата обов’язкова.'
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      errors.rating = 'Оцінка від 1 до 10.'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setFormError('Перевірте поля форми.')
      return
    }

    setSaving(true)
    setFormError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await journalApi.update(editingId, {
          testedOn,
          rating: ratingNum,
          notes: notes.trim() || null,
          openingImpression: opening.trim() || null,
          heartImpression: heart.trim() || null,
          baseImpression: base.trim() || null,
          wearMinutes: wearMinutes ? Number.parseInt(wearMinutes, 10) : null,
        })
        setSuccess('Запис оновлено.')
      } else {
        const payload: CreateJournalEntryRequest = {
          perfumeId: perfumeIdNum,
          testedOn,
          rating: ratingNum,
          notes: notes.trim() || null,
          openingImpression: opening.trim() || null,
          heartImpression: heart.trim() || null,
          baseImpression: base.trim() || null,
          wearMinutes: wearMinutes ? Number.parseInt(wearMinutes, 10) : null,
        }
        await journalApi.create(payload)
        setSuccess('Запис створено.')
      }
      resetForm()
      setShowForm(false)
      setReload((v) => v + 1)
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setFormError(getApiErrorMessage(err, 'Не вдалося зберегти запис.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Видалити запис щоденника?')) return
    try {
      await journalApi.remove(id)
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося видалити запис.'))
    }
  }

  return (
    <PageContainer
      title="Щоденник тестування"
      description="Записи про тестування ароматів: оцінка, враження від старту, серця та бази."
    >
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => {
            resetForm()
            setShowForm(true)
            setSuccess(null)
          }}
        >
          Новий запис
        </Button>
        <ButtonLink to={ROUTES.catalog} variant="ghost" size="sm">
          Каталог
        </ButtonLink>
      </div>

      <div className={styles.filters}>
        <Input
          label="Парфум ID"
          value={filterPerfumeId}
          onChange={(e) => {
            setFilterPerfumeId(e.target.value)
            setPage(1)
          }}
        />
        <Input
          label="Оцінка"
          type="number"
          min={1}
          max={10}
          value={filterRating}
          onChange={(e) => {
            setFilterRating(e.target.value)
            setPage(1)
          }}
        />
        <Input
          label="Від"
          type="date"
          value={filterFrom}
          onChange={(e) => {
            setFilterFrom(e.target.value)
            setPage(1)
          }}
        />
        <Input
          label="До"
          type="date"
          value={filterTo}
          onChange={(e) => {
            setFilterTo(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {showForm ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSave()
          }}
        >
          <h2 className={styles.cardTitle}>
            {editingId ? 'Редагування запису' : 'Новий запис'}
          </h2>
          {!editingId ? (
            <Input
              label="ID парфуму"
              value={perfumeId}
              error={fieldErrors.perfumeId}
              onChange={(e) => setPerfumeId(e.target.value)}
            />
          ) : null}
          <div className={styles.grid}>
            <Input
              label="Дата тестування"
              type="date"
              value={testedOn}
              error={fieldErrors.testedOn}
              onChange={(e) => setTestedOn(e.target.value)}
            />
            <Input
              label="Оцінка (1–10)"
              type="number"
              min={1}
              max={10}
              value={rating}
              error={fieldErrors.rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <Input
              label="Тривалість, хв"
              type="number"
              value={wearMinutes}
              onChange={(e) => setWearMinutes(e.target.value)}
            />
          </div>
          <label>
            Нотатки
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label>
            Старт
            <textarea
              className={styles.textarea}
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
            />
          </label>
          <label>
            Серце
            <textarea
              className={styles.textarea}
              value={heart}
              onChange={(e) => setHeart(e.target.value)}
            />
          </label>
          <label>
            База
            <textarea
              className={styles.textarea}
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
          {formError ? <p className={styles.error}>{formError}</p> : null}
          <div className={styles.actions}>
            <Button type="submit" variant="accent" loading={saving}>
              Зберегти
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              Скасувати
            </Button>
          </div>
        </form>
      ) : null}

      {success ? <p className={styles.success}>{success}</p> : null}
      {loading ? <LoadingState label="Завантаження щоденника…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && result && result.items.length === 0 ? (
        <EmptyState
          title="Записів ще немає"
          message="Створіть перший запис про тестування аромату."
        />
      ) : null}
      {!loading && !error && result && result.items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {result.items.map((entry) => (
              <li key={entry.id} className={styles.card}>
                <Link
                  to={perfumeDetailsPath(entry.perfumeId)}
                  className={styles.link}
                >
                  {entry.perfume?.name ?? `Парфум #${entry.perfumeId}`}
                </Link>
                <p className={styles.meta}>
                  {entry.testedOn.slice(0, 10)} · оцінка {entry.rating}/10
                  {entry.perfume?.brand?.name
                    ? ` · ${entry.perfume.brand.name}`
                    : ''}
                </p>
                {entry.notes ? (
                  <p className={styles.meta}>{excerpt(entry.notes)}</p>
                ) : null}
                <div className={styles.actions}>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(entry)}
                  >
                    Редагувати
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => void handleDelete(entry.id)}
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
