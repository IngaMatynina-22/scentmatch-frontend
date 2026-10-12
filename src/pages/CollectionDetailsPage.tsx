import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PerfumeCard } from '@/features/catalog/ui/PerfumeCard'
import layoutStyles from '@/features/catalog/ui/CatalogPageView.module.css'
import {
  AddPerfumePanel,
  CollectionForm,
  ConfirmDeletePanel,
  collectionsApi,
  collectionToForm,
  emptyCollectionForm,
  formToPayload,
  validateCollectionForm,
  type CollectionDetails,
  type CollectionFormState,
} from '@/features/collections'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './CollectionDetailsPage.module.css'

export function CollectionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const collectionId = Number.parseInt(id ?? '', 10)
  const validId = Number.isFinite(collectionId) && collectionId > 0

  const [details, setDetails] = useState<CollectionDetails | null>(null)
  const [loading, setLoading] = useState(validId)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(emptyCollectionForm())
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({})
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [removingId, setRemovingId] = useState<number | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const editingRef = useRef(false)

  useEffect(() => {
    editingRef.current = editing
  }, [editing])

  useEffect(() => {
    if (!validId) return

    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const response = await collectionsApi.getById(collectionId, controller.signal)
        if (!controller.signal.aborted) {
          setDetails(response)
          if (!editingRef.current) {
            setEditForm(collectionToForm(response))
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setDetails(null)
        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setNotFound(true)
        } else {
          setError(getApiErrorMessage(err, 'Не вдалося завантажити колекцію.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [collectionId, validId, reloadToken])

  const existingIds = useMemo(() => {
    return new Set(details?.perfumes.map((perfume) => perfume.id) ?? [])
  }, [details])

  async function handleSave() {
    const localErrors = validateCollectionForm(editForm)
    setEditFieldErrors(localErrors)
    setEditError(null)
    if (Object.keys(localErrors).length > 0 || saving || !details) return

    setSaving(true)
    try {
      const updated = await collectionsApi.update(details.id, formToPayload(editForm))
      setDetails((current) =>
        current
          ? {
              ...current,
              name: updated.name,
              description: updated.description,
              perfumeCount: updated.perfumeCount,
              updatedAt: updated.updatedAt,
            }
          : current,
      )
      setEditForm(collectionToForm(updated))
      setEditing(false)
    } catch (err) {
      setEditFieldErrors(getFieldErrors(err))
      setEditError(getApiErrorMessage(err, 'Не вдалося зберегти колекцію.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!details || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await collectionsApi.remove(details.id)
      navigate(ROUTES.collections, { replace: true })
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити колекцію.'))
    } finally {
      setDeleting(false)
    }
  }

  async function handleRemovePerfume(perfumeId: number) {
    if (!details || removingId !== null) return
    setRemovingId(perfumeId)
    setRemoveError(null)

    const previous = details
    setDetails({
      ...details,
      perfumeCount: Math.max(0, details.perfumeCount - 1),
      perfumes: details.perfumes.filter((perfume) => perfume.id !== perfumeId),
    })

    try {
      await collectionsApi.removePerfume(details.id, perfumeId)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        return
      }
      setDetails(previous)
      setRemoveError(getApiErrorMessage(err, 'Не вдалося прибрати парфум.'))
    } finally {
      setRemovingId(null)
    }
  }

  if (!validId || notFound) {
    return (
      <PageContainer title="Колекцію не знайдено">
        <ErrorState
          title="404"
          message="Колекція відсутня або недоступна для вашого облікового запису."
          action={<ButtonLink to={ROUTES.collections}>До колекцій</ButtonLink>}
        />
      </PageContainer>
    )
  }

  if (loading) {
    return (
      <PageContainer title="Колекція">
        <LoadingState label="Завантаження колекції…" />
      </PageContainer>
    )
  }

  if (error || !details) {
    return (
      <PageContainer title="Колекція">
        <ErrorState
          title="Помилка завантаження"
          message={error ?? 'Невідома помилка.'}
          onRetry={() => setReloadToken((value) => value + 1)}
          action={<ButtonLink to={ROUTES.collections}>До колекцій</ButtonLink>}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer title={details.name} description={details.description ?? undefined}>
      <Link to={ROUTES.collections} className={styles.backLink}>
        ← До списку колекцій
      </Link>

      <div className={styles.toolbar}>
        {!editing && !confirmDelete ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(true)
                setEditForm(collectionToForm(details))
                setEditError(null)
                setEditFieldErrors({})
              }}
            >
              Редагувати
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                setConfirmDelete(true)
                setDeleteError(null)
              }}
            >
              Видалити
            </Button>
          </>
        ) : null}
      </div>

      {confirmDelete ? (
        <div className={styles.panel}>
          <ConfirmDeletePanel
            title="Видалити колекцію?"
            message={`«${details.name}» буде видалено разом із прив’язками парфумів. Самі парфуми в каталозі залишаться.`}
            confirming={deleting}
            error={deleteError}
            onConfirm={() => void handleDelete()}
            onCancel={() => setConfirmDelete(false)}
          />
        </div>
      ) : null}

      {editing ? (
        <div className={styles.panel}>
          <CollectionForm
            title="Редагування колекції"
            form={editForm}
            fieldErrors={editFieldErrors}
            formError={editError}
            submitting={saving}
            submitLabel="Зберегти"
            onChange={(next: CollectionFormState) => {
              setEditForm(next)
              setEditFieldErrors({})
            }}
            onSubmit={() => void handleSave()}
            onCancel={() => {
              setEditing(false)
              setEditForm(collectionToForm(details))
              setEditError(null)
              setEditFieldErrors({})
            }}
          />
        </div>
      ) : null}

      <p className={styles.meta}>
        {details.perfumeCount === 1 ? '1 парфум' : `${details.perfumeCount} парфумів`}
      </p>

      {removeError ? (
        <p className={styles.error} role="alert">
          {removeError}
        </p>
      ) : null}

      {details.perfumes.length === 0 ? (
        <EmptyState
          title="Колекція порожня"
          message="Додайте парфуми з каталогу через пошук нижче."
        />
      ) : (
        <div className={layoutStyles.grid}>
          {details.perfumes.map((perfume) => (
            <div key={perfume.id} className={styles.cardWrap}>
              <PerfumeCard perfume={perfume} />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                fullWidth
                loading={removingId === perfume.id}
                disabled={removingId !== null}
                onClick={() => void handleRemovePerfume(perfume.id)}
              >
                Прибрати з колекції
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.addPanel}>
        <AddPerfumePanel
          collectionId={details.id}
          existingPerfumeIds={existingIds}
          onAdded={() => setReloadToken((value) => value + 1)}
        />
      </div>
    </PageContainer>
  )
}
