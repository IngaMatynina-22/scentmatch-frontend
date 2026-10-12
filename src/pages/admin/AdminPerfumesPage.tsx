import { useEffect, useState } from 'react'
import type { Brand, FragranceType, Note, Season } from '@/entities/perfume'
import { adminApi } from '@/features/admin/api/adminApi'
import type { PerfumeDetails } from '@/features/admin/model/types'
import {
  AdminPerfumeForm,
  emptyPerfumeForm,
  perfumeFormToPayload,
  type PerfumeFormState,
} from '@/features/admin/ui/AdminPerfumeForm'
import { ConfirmDeletePanel } from '@/features/collections'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './AdminPerfumesPage.module.css'

export function AdminPerfumesPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [fragranceTypes, setFragranceTypes] = useState<FragranceType[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [dictError, setDictError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [result, setResult] = useState<PagedResult<PerfumeDetails> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PerfumeFormState>(emptyPerfumeForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadDicts() {
      setDictError(null)
      try {
        const [brandList, typeList, noteList, seasonList] = await Promise.all([
          adminApi.listBrands(controller.signal),
          adminApi.listFragranceTypes(controller.signal),
          adminApi.listNotes(controller.signal),
          adminApi.listSeasons(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setBrands(brandList)
          setFragranceTypes(typeList)
          setNotes(noteList)
          setSeasons(seasonList)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setDictError(getApiErrorMessage(err, 'Не вдалося завантажити довідники.'))
        }
      }
    }
    void loadDicts()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await adminApi.listPerfumes(
          { page, pageSize: 12, search: searchApplied || undefined },
          controller.signal,
        )
        if (!controller.signal.aborted) setResult(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити парфуми.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [page, searchApplied, reloadToken])

  function openCreate() {
    setEditingId(null)
    setForm(emptyPerfumeForm())
    setFieldErrors({})
    setFormError(null)
    setShowForm(true)
  }

  async function openEdit(id: number) {
    setFormError(null)
    setFieldErrors({})
    try {
      const perfume = await adminApi.getPerfume(id)
      setEditingId(id)
      setForm({
        ...emptyPerfumeForm(),
        name: perfume.name,
        brandId: String(perfume.brand.id),
        fragranceTypeId: String(perfume.fragranceType.id),
        description: perfume.description ?? '',
        releaseYear: perfume.releaseYear != null ? String(perfume.releaseYear) : '',
        concentration: perfume.concentration ?? '',
        gender: perfume.gender ?? '',
        price: perfume.price != null ? String(perfume.price) : '',
        imageUrl: perfume.imageUrl ?? '',
        sweetness: perfume.characteristics?.sweetness?.toString() ?? '',
        freshness: perfume.characteristics?.freshness?.toString() ?? '',
        woody: perfume.characteristics?.woody?.toString() ?? '',
        spicy: perfume.characteristics?.spicy?.toString() ?? '',
        citrus: perfume.characteristics?.citrus?.toString() ?? '',
        floral: perfume.characteristics?.floral?.toString() ?? '',
        fruity: perfume.characteristics?.fruity?.toString() ?? '',
        powdery: perfume.characteristics?.powdery?.toString() ?? '',
        smoky: perfume.characteristics?.smoky?.toString() ?? '',
        oriental: perfume.characteristics?.oriental?.toString() ?? '',
        notes: (perfume.notes ?? []).map((note) => ({
          noteId: note.noteId,
          noteType: note.noteType,
          label: note.name,
        })),
        seasons: (perfume.seasons ?? []).map((season) => ({
          seasonId: season.seasonId,
          suitability: season.suitability ?? 50,
          label: season.name,
        })),
        shopLinks: (perfume.shopLinks ?? []).map((link) => ({
          storeName: link.storeName,
          url: link.url,
        })),
      })
      setShowForm(true)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Не вдалося відкрити парфум.'))
      setShowForm(true)
    }
  }

  async function handleSubmit() {
    if (submitting) return
    if (!form.name.trim() || !form.brandId || !form.fragranceTypeId) {
      setFieldErrors({
        name: !form.name.trim() ? 'Обов’язкове поле.' : '',
        brandId: !form.brandId ? 'Оберіть бренд.' : '',
        fragranceTypeId: !form.fragranceTypeId ? 'Оберіть тип.' : '',
      })
      return
    }

    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})
    try {
      const payload = perfumeFormToPayload(form)
      if (editingId != null) {
        await adminApi.updatePerfume(editingId, payload)
      } else {
        await adminApi.createPerfume(payload)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyPerfumeForm())
      setReloadToken((value) => value + 1)
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setFormError(getApiErrorMessage(err, 'Не вдалося зберегти парфум.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (deleteId == null || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await adminApi.deletePerfume(deleteId)
      setDeleteId(null)
      setReloadToken((value) => value + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити парфум.'))
    } finally {
      setDeleting(false)
    }
  }

  const items = result?.items ?? []

  return (
    <PageContainer
      title="Адмін · Парфуми"
      description="Створення, редагування та видалення парфумів через /api/admin/perfumes."
    >
      {dictError ? <p className={styles.error}>{dictError}</p> : null}

      <div className={styles.toolbar}>
        <Button type="button" variant="accent" onClick={openCreate}>
          Новий парфум
        </Button>
        <form
          className={styles.search}
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setSearchApplied(search.trim())
          }}
        >
          <Input
            label="Пошук"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit" size="sm" variant="ghost">
            Знайти
          </Button>
        </form>
      </div>

      {showForm ? (
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>
            {editingId != null ? `Редагування #${editingId}` : 'Новий парфум'}
          </h2>
          <AdminPerfumeForm
            form={form}
            brands={brands}
            fragranceTypes={fragranceTypes}
            notes={notes}
            seasons={seasons}
            fieldErrors={fieldErrors}
            formError={formError}
            submitting={submitting}
            submitLabel={editingId != null ? 'Зберегти' : 'Створити'}
            onChange={setForm}
            onSubmit={() => void handleSubmit()}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
              setForm(emptyPerfumeForm())
            }}
          />
        </div>
      ) : null}

      {deleteId != null ? (
        <div className={styles.confirm}>
          <ConfirmDeletePanel
            title="Видалити парфум?"
            message="Парфум буде деактивовано/видалено на сервері (admin DELETE)."
            confirming={deleting}
            error={deleteError}
            onConfirm={() => void handleDelete()}
            onCancel={() => setDeleteId(null)}
          />
        </div>
      ) : null}

      {loading ? <LoadingState label="Завантаження парфумів…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="Немає парфумів" message="Створіть перший або змініть пошук." />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <ul className={styles.list}>
            {items.map((perfume) => (
              <li key={perfume.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{perfume.name}</p>
                  <p className={styles.itemMeta}>
                    #{perfume.id} · {perfume.brand.name} · {perfume.fragranceType.name}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void openEdit(perfume.id)}
                  >
                    Редагувати
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setDeleteId(perfume.id)
                      setDeleteError(null)
                    }}
                  >
                    Видалити
                  </Button>
                </div>
              </li>
            ))}
          </ul>
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
