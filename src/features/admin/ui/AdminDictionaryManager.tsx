import { useEffect, useState } from 'react'
import { ConfirmDeletePanel } from '@/features/collections'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Textarea } from '@/shared/ui/Textarea'
import styles from './AdminDictionaryManager.module.css'

export type AdminField = {
  key: string
  label: string
  kind?: 'text' | 'textarea'
  required?: boolean
  maxLength?: number
}

type ItemBase = { id: number }

type AdminDictionaryManagerProps<T extends ItemBase> = {
  title: string
  description: string
  fields: AdminField[]
  loadItems: (signal?: AbortSignal) => Promise<T[]>
  createItem: (payload: Record<string, string | null>) => Promise<T>
  updateItem: (id: number, payload: Record<string, string | null>) => Promise<T>
  deleteItem: (id: number) => Promise<void>
  toForm: (item: T) => Record<string, string>
  summarize: (item: T) => string
}

function emptyForm(fields: AdminField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, '']))
}

function toPayload(
  form: Record<string, string>,
  fields: AdminField[],
): Record<string, string | null> {
  const payload: Record<string, string | null> = {}
  for (const field of fields) {
    const value = (form[field.key] ?? '').trim()
    payload[field.key] = value.length > 0 ? value : null
  }
  return payload
}

export function AdminDictionaryManager<T extends ItemBase>({
  title,
  description,
  fields,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  toForm,
  summarize,
}: AdminDictionaryManagerProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [form, setForm] = useState(() => emptyForm(fields))
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await loadItems(controller.signal)
        if (!controller.signal.aborted) setItems(list)
      } catch (err) {
        if (controller.signal.aborted) return
        setItems([])
        setError(getApiErrorMessage(err, 'Не вдалося завантажити список.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [loadItems, reloadToken])

  function resetForm() {
    setForm(emptyForm(fields))
    setEditingId(null)
    setFieldErrors({})
    setFormError(null)
  }

  function startEdit(item: T) {
    setForm(toForm(item))
    setEditingId(item.id)
    setFieldErrors({})
    setFormError(null)
    setSuccess(null)
  }

  async function handleSubmit() {
    const requiredMissing = fields.find(
      (field) => field.required && !(form[field.key] ?? '').trim(),
    )
    if (requiredMissing) {
      setFieldErrors({ [requiredMissing.key]: 'Обов’язкове поле.' })
      return
    }
    if (submitting) return

    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})
    setSuccess(null)
    const payload = toPayload(form, fields)

    try {
      if (editingId != null) {
        const updated = await updateItem(editingId, payload)
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setSuccess('Збережено.')
      } else {
        const created = await createItem(payload)
        setItems((current) => [...current, created].sort((a, b) => a.id - b.id))
        setSuccess('Створено.')
      }
      resetForm()
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setFormError(getApiErrorMessage(err, 'Не вдалося зберегти.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (deleteId == null || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteItem(deleteId)
      setItems((current) => current.filter((item) => item.id !== deleteId))
      if (editingId === deleteId) resetForm()
      setDeleteId(null)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити.'))
    } finally {
      setDeleting(false)
    }
  }

  const deleteTarget = items.find((item) => item.id === deleteId)

  return (
    <PageContainer title={title} description={description}>
      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
          noValidate
        >
          <h2 className={styles.formTitle}>
            {editingId != null ? 'Редагування' : 'Новий запис'}
          </h2>
          {formError ? (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          ) : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          {fields.map((field) =>
            field.kind === 'textarea' ? (
              <Textarea
                key={field.key}
                label={field.label}
                name={field.key}
                value={form[field.key] ?? ''}
                maxLength={field.maxLength}
                error={fieldErrors[field.key]}
                disabled={submitting}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            ) : (
              <Input
                key={field.key}
                label={field.label}
                name={field.key}
                value={form[field.key] ?? ''}
                maxLength={field.maxLength}
                required={field.required}
                error={fieldErrors[field.key]}
                disabled={submitting}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            ),
          )}

          <div className={styles.actions}>
            <Button type="submit" loading={submitting} disabled={submitting}>
              {editingId != null ? 'Зберегти' : 'Створити'}
            </Button>
            {editingId != null ? (
              <Button type="button" variant="ghost" disabled={submitting} onClick={resetForm}>
                Скасувати
              </Button>
            ) : null}
          </div>
        </form>

        <div className={styles.listPanel}>
          {deleteId != null && deleteTarget ? (
            <div className={styles.confirm}>
              <ConfirmDeletePanel
                title="Видалити запис?"
                message={`«${summarize(deleteTarget)}» буде видалено.`}
                confirming={deleting}
                error={deleteError}
                onConfirm={() => void handleDelete()}
                onCancel={() => setDeleteId(null)}
              />
            </div>
          ) : null}

          {loading ? <LoadingState label="Завантаження…" /> : null}
          {!loading && error ? (
            <ErrorState
              title="Помилка"
              message={error}
              onRetry={() => setReloadToken((value) => value + 1)}
            />
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <EmptyState title="Порожньо" message="Створіть перший запис." />
          ) : null}
          {!loading && !error && items.length > 0 ? (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div>
                    <p className={styles.itemTitle}>{summarize(item)}</p>
                    <p className={styles.itemMeta}>#{item.id}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <Button type="button" size="sm" variant="ghost" onClick={() => startEdit(item)}>
                      Редагувати
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setDeleteId(item.id)
                        setDeleteError(null)
                      }}
                    >
                      Видалити
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
