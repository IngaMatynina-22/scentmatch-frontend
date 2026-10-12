import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { collectionsApi } from '@/features/collections/api/collectionsApi'
import type { CollectionSummary } from '@/features/collections/model/types'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { loginPathWithReturn, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import styles from './AddToCollectionButton.module.css'

type AddToCollectionButtonProps = {
  perfumeId: number
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

async function fetchAllCollections(signal?: AbortSignal): Promise<CollectionSummary[]> {
  const items: CollectionSummary[] = []
  let page = 1
  let totalPages = 1

  do {
    const result = await collectionsApi.getList({ page, pageSize: 100 }, signal)
    items.push(...result.items)
    totalPages = Math.max(1, result.totalPages)
    page += 1
  } while (page <= totalPages)

  return items
}

export function AddToCollectionButton({
  perfumeId,
  size = 'sm',
  fullWidth = false,
}: AddToCollectionButtonProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [status, setStatus] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  )
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!open || !isAuthenticated) return

    const controller = new AbortController()

    async function load() {
      setLoadingList(true)
      setListError(null)
      try {
        const items = await fetchAllCollections(controller.signal)
        if (!controller.signal.aborted) {
          setCollections(items)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setCollections([])
        setListError(getApiErrorMessage(error, 'Не вдалося завантажити колекції.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [open, isAuthenticated, reloadToken])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handleTrigger() {
    setStatus(null)

    if (!isAuthenticated) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      navigate(loginPathWithReturn(returnTo))
      return
    }

    setOpen((value) => !value)
  }

  async function handleAdd(collection: CollectionSummary) {
    if (pendingId !== null) return

    setPendingId(collection.id)
    setStatus(null)

    try {
      await collectionsApi.addPerfume(collection.id, perfumeId)
      setStatus({
        tone: 'success',
        text: `Додано до «${collection.name}».`,
      })
      setOpen(false)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT') {
        setStatus({
          tone: 'info',
          text: `Уже є в «${collection.name}».`,
        })
        setOpen(false)
        return
      }
      setStatus({
        tone: 'error',
        text: getApiErrorMessage(error, 'Не вдалося додати до колекції.'),
      })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div
      className={[styles.root, fullWidth ? styles.fullWidth : ''].filter(Boolean).join(' ')}
      ref={rootRef}
    >
      <Button
        type="button"
        size={size}
        variant="ghost"
        fullWidth={fullWidth}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={pendingId !== null}
        onClick={handleTrigger}
      >
        До колекції
      </Button>

      {open ? (
        <div className={styles.panel} id={listboxId} role="listbox" aria-label="Ваші колекції">
          {loadingList ? <p className={styles.status}>Завантаження…</p> : null}

          {!loadingList && listError ? (
            <div className={styles.errorBlock}>
              <p className={styles.error}>{listError}</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                Повторити
              </Button>
            </div>
          ) : null}

          {!loadingList && !listError && collections.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.status}>Колекцій ще немає.</p>
              <Link to={ROUTES.collections} className={styles.link} onClick={() => setOpen(false)}>
                Створити колекцію
              </Link>
            </div>
          ) : null}

          {!loadingList && !listError && collections.length > 0 ? (
            <ul className={styles.list}>
              {collections.map((collection) => {
                const pending = pendingId === collection.id
                return (
                  <li key={collection.id}>
                    <button
                      type="button"
                      role="option"
                      className={styles.option}
                      disabled={pendingId !== null}
                      aria-busy={pending || undefined}
                      onClick={() => void handleAdd(collection)}
                    >
                      <span className={styles.optionName}>{collection.name}</span>
                      <span className={styles.optionMeta}>
                        {pending
                          ? 'Додаємо…'
                          : collection.perfumeCount === 1
                            ? '1 парфум'
                            : `${collection.perfumeCount} парфумів`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      {status ? (
        <p
          className={[
            styles.feedback,
            status.tone === 'success'
              ? styles.feedbackSuccess
              : status.tone === 'info'
                ? styles.feedbackInfo
                : styles.feedbackError,
          ].join(' ')}
          role={status.tone === 'error' ? 'alert' : 'status'}
        >
          {status.text}
          {status.tone === 'error' ? (
            <>
              {' '}
              <button type="button" className={styles.retry} onClick={handleTrigger}>
                Спробувати знову
              </button>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
