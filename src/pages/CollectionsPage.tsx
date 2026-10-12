import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CollectionForm,
  CollectionImportExportPanel,
  CollectionListItem,
  collectionsApi,
  emptyCollectionForm,
  formToPayload,
  validateCollectionForm,
  type CollectionFormState,
  type CollectionSummary,
} from '@/features/collections'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { collectionPath } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './CollectionsPage.module.css'

const PAGE_SIZE = 20

export function CollectionsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<CollectionSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCollectionForm())
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({})
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await collectionsApi.getList(
          { page, pageSize: PAGE_SIZE },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити колекції.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  async function handleCreate() {
    const localErrors = validateCollectionForm(createForm)
    setCreateFieldErrors(localErrors)
    setCreateError(null)
    if (Object.keys(localErrors).length > 0 || creating) return

    setCreating(true)
    try {
      const created = await collectionsApi.create(formToPayload(createForm))
      setCreateForm(emptyCollectionForm())
      setShowCreate(false)
      navigate(collectionPath(created.id))
    } catch (err) {
      setCreateFieldErrors(getFieldErrors(err))
      setCreateError(getApiErrorMessage(err, 'Не вдалося створити колекцію.'))
    } finally {
      setCreating(false)
    }
  }

  function openCreate() {
    setShowCreate(true)
    setCreateError(null)
    setCreateFieldErrors({})
  }

  function cancelCreate() {
    setShowCreate(false)
    setCreateError(null)
    setCreateFieldErrors({})
    // Keep draft so a temporary network error does not wipe input if user reopens after failed submit
  }

  const items = result?.items ?? []

  return (
    <PageContainer
      title="Колекції"
      description="Збирайте парфуми в тематичні списки — окремо від обраного."
    >
      <div className={styles.toolbar}>
        {!showCreate ? (
          <Button type="button" variant="accent" onClick={openCreate}>
            Нова колекція
          </Button>
        ) : null}
      </div>

      {showCreate ? (
        <div className={styles.create}>
          <CollectionForm
            title="Нова колекція"
            form={createForm}
            fieldErrors={createFieldErrors}
            formError={createError}
            submitting={creating}
            submitLabel="Створити"
            onChange={(next: CollectionFormState) => {
              setCreateForm(next)
              setCreateFieldErrors({})
            }}
            onSubmit={() => void handleCreate()}
            onCancel={cancelCreate}
          />
        </div>
      ) : null}

      <CollectionImportExportPanel
        onImported={() => setReloadToken((value) => value + 1)}
      />

      {loading ? <LoadingState label="Завантаження колекцій…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка завантаження"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Колекцій ще немає"
          message="Створіть першу колекцію, щоб групувати парфуми за настроєм або сезоном."
          action={
            !showCreate ? (
              <Button type="button" onClick={openCreate}>
                Створити колекцію
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <p className={styles.meta}>
            {result?.totalItems ?? items.length}{' '}
            {(result?.totalItems ?? items.length) === 1 ? 'колекція' : 'колекцій'}
          </p>
          <div className={styles.list}>
            {items.map((collection) => (
              <CollectionListItem key={collection.id} collection={collection} />
            ))}
          </div>
          {result && result.totalPages > 1 ? (
            <CatalogPagination
              page={result.page}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : null}
    </PageContainer>
  )
}
