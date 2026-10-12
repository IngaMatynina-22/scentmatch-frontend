import { useEffect, useState } from 'react'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { ConfirmDeletePanel } from '@/features/collections'
import {
  NotificationCard,
  notificationsApi,
  useNotifications,
  type NotificationItem,
} from '@/features/notifications'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './NotificationsPage.module.css'

const PAGE_SIZE = 20

export function NotificationsPage() {
  const { unreadCount, refreshUnreadCount } = useNotifications()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<NotificationItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [markingId, setMarkingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await notificationsApi.getList(
          { page, pageSize: PAGE_SIZE },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити сповіщення.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [page, reloadToken])

  async function handleMarkRead(id: number) {
    if (markingId !== null || deletingId !== null) return
    setMarkingId(id)
    setActionError(null)

    const previous = result
    setResult((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === id ? { ...item, isRead: true } : item,
            ),
          }
        : current,
    )

    try {
      await notificationsApi.markAsRead(id)
      await refreshUnreadCount()
    } catch (err) {
      setResult(previous)
      setActionError(getApiErrorMessage(err, 'Не вдалося позначити сповіщення прочитаним.'))
    } finally {
      setMarkingId(null)
    }
  }

  async function handleMarkAll() {
    if (markingAll || markingId !== null) return
    setMarkingAll(true)
    setActionError(null)

    const previous = result
    setResult((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => ({ ...item, isRead: true })),
          }
        : current,
    )

    try {
      await notificationsApi.markAllAsRead()
      await refreshUnreadCount()
    } catch (err) {
      setResult(previous)
      setActionError(getApiErrorMessage(err, 'Не вдалося позначити всі сповіщення прочитаними.'))
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleDelete(id: number) {
    if (deletingId !== null || markingId !== null) return
    setDeletingId(id)
    setActionError(null)

    const previous = result
    setResult((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== id),
            totalItems: Math.max(0, current.totalItems - 1),
          }
        : current,
    )

    try {
      await notificationsApi.remove(id)
      await refreshUnreadCount()
      if (previous && previous.items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      } else if (previous && previous.items.length === 1) {
        setReloadToken((value) => value + 1)
      }
    } catch (err) {
      setResult(previous)
      setActionError(getApiErrorMessage(err, 'Не вдалося видалити сповіщення.'))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClear() {
    if (clearing) return
    setClearing(true)
    setClearError(null)
    try {
      await notificationsApi.clear()
      setConfirmClear(false)
      setPage(1)
      setReloadToken((value) => value + 1)
      await refreshUnreadCount()
    } catch (err) {
      setClearError(getApiErrorMessage(err, 'Не вдалося очистити сповіщення.'))
    } finally {
      setClearing(false)
    }
  }

  const items = result?.items ?? []
  const hasUnreadOnPage = items.some((item) => !item.isRead)
  const showMarkAll = unreadCount > 0 || hasUnreadOnPage

  return (
    <PageContainer
      title="Сповіщення"
      description="Повідомлення про каталог, рейтинги, модерацію відгуків і рекомендації."
    >
      <div className={styles.toolbar}>
        {showMarkAll && !confirmClear ? (
          <Button
            type="button"
            variant="accent"
            loading={markingAll}
            disabled={loading || markingAll || markingId !== null}
            onClick={() => void handleMarkAll()}
          >
            Позначити всі прочитаними
          </Button>
        ) : null}
        {!loading && !error && items.length > 0 && !confirmClear ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setConfirmClear(true)
              setClearError(null)
            }}
          >
            Очистити всі
          </Button>
        ) : null}
      </div>

      {confirmClear ? (
        <div className={styles.confirm}>
          <ConfirmDeletePanel
            title="Очистити всі сповіщення?"
            message="Усі повідомлення буде видалено. Нові з’являться, коли backend знову надішле події."
            confirming={clearing}
            error={clearError}
            onConfirm={() => void handleClear()}
            onCancel={() => setConfirmClear(false)}
          />
        </div>
      ) : null}

      {actionError ? (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? <LoadingState label="Завантаження сповіщень…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка завантаження"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Немає сповіщень"
          message="Коли з’являться оновлення каталогу, рейтингу, відгуків або рекомендацій — вони будуть тут."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <p className={styles.meta}>
            {result?.totalItems ?? items.length}{' '}
            {(result?.totalItems ?? items.length) === 1 ? 'сповіщення' : 'сповіщень'}
            {unreadCount > 0 ? ` · непрочитаних: ${unreadCount}` : ''}
          </p>
          <div className={styles.list}>
            {items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                marking={markingId === notification.id}
                deleting={deletingId === notification.id}
                onMarkRead={() => void handleMarkRead(notification.id)}
                onDelete={() => void handleDelete(notification.id)}
              />
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
