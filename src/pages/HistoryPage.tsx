import { useEffect, useState } from 'react'
import type { FragranceType, Note, Season } from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { CatalogPagination } from '@/features/catalog/ui/CatalogPagination'
import { ConfirmDeletePanel } from '@/features/collections'
import {
  SelectionHistoryCard,
  selectionHistoryApi,
  type SelectionHistoryEntry,
} from '@/features/history'
import { RecommendationHistoryPanel } from '@/features/recommendations/ui/RecommendationHistoryPanel'
import { ViewHistoryPanel } from '@/features/view-history/ui/ViewHistoryPanel'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import type { PagedResult } from '@/shared/api/paging'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './HistoryPage.module.css'

const PAGE_SIZE = 10

type HistoryTab = 'selections' | 'views' | 'recommendations'

const TABS: { id: HistoryTab; label: string }[] = [
  { id: 'selections', label: 'Підбори' },
  { id: 'views', label: 'Перегляди' },
  { id: 'recommendations', label: 'Рекомендації' },
]

export function HistoryPage() {
  const [tab, setTab] = useState<HistoryTab>('selections')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PagedResult<SelectionHistoryEntry> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [seasons, setSeasons] = useState<Season[]>([])
  const [fragranceTypes, setFragranceTypes] = useState<FragranceType[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [dictError, setDictError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDictionaries() {
      setDictError(null)
      try {
        const [seasonList, typeList, noteList] = await Promise.all([
          catalogApi.getSeasons(controller.signal),
          catalogApi.getFragranceTypes(controller.signal),
          catalogApi.getNotes(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setSeasons(seasonList)
          setFragranceTypes(typeList)
          setNotes(noteList)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setDictError(
          getApiErrorMessage(err, 'Не вдалося завантажити назви сезонів, типів і нот.'),
        )
      }
    }

    void loadDictionaries()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (tab !== 'selections') return
    const controller = new AbortController()

    async function loadHistory() {
      setLoading(true)
      setError(null)
      try {
        const response = await selectionHistoryApi.getList(
          { page, pageSize: PAGE_SIZE },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setResult(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити історію підборів.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadHistory()
    return () => controller.abort()
  }, [page, reloadToken, tab])

  async function handleDelete(id: number) {
    if (deletingId !== null) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      await selectionHistoryApi.remove(id)
      if (result && result.items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      } else {
        setReloadToken((value) => value + 1)
      }
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Не вдалося видалити запис.'))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClear() {
    if (clearing) return
    setClearing(true)
    setClearError(null)
    try {
      await selectionHistoryApi.clear()
      setConfirmClear(false)
      setPage(1)
      setReloadToken((value) => value + 1)
    } catch (err) {
      setClearError(getApiErrorMessage(err, 'Не вдалося очистити історію.'))
    } finally {
      setClearing(false)
    }
  }

  const items = result?.items ?? []

  return (
    <PageContainer
      title="Історія"
      description="Підбори, перегляди парфумів і збережені batch-і рекомендацій."
    >
      <div className={styles.tabs} role="tablist" aria-label="Тип історії">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? styles.tabActive : styles.tab}
            onClick={() => {
              setTab(item.id)
              setConfirmClear(false)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'selections' ? (
        <>
          <div className={styles.toolbar}>
            <ButtonLink to={ROUTES.match} variant="accent">
              Новий підбір
            </ButtonLink>
            {!loading && !error && items.length > 0 && !confirmClear ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setConfirmClear(true)
                  setClearError(null)
                }}
              >
                Очистити історію
              </Button>
            ) : null}
          </div>

          {confirmClear ? (
            <div className={styles.confirm}>
              <ConfirmDeletePanel
                title="Очистити всю історію?"
                message="Усі збережені підбори буде видалено. Це не вплине на каталог і обране."
                confirming={clearing}
                error={clearError}
                onConfirm={() => void handleClear()}
                onCancel={() => setConfirmClear(false)}
              />
            </div>
          ) : null}

          {dictError ? <p className={styles.hintError}>{dictError}</p> : null}
          {deleteError ? (
            <p className={styles.hintError} role="alert">
              {deleteError}
            </p>
          ) : null}

          {loading ? <LoadingState label="Завантаження історії…" /> : null}

          {!loading && error ? (
            <ErrorState
              title="Помилка завантаження"
              message={error}
              onRetry={() => setReloadToken((value) => value + 1)}
            />
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <EmptyState
              title="Історія порожня"
              message="Виконайте персональний підбір — результат автоматично з’явиться тут."
              action={<ButtonLink to={ROUTES.match}>До підбору</ButtonLink>}
            />
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <>
              <p className={styles.meta}>
                {result?.totalItems ?? items.length}{' '}
                {(result?.totalItems ?? items.length) === 1 ? 'запис' : 'записів'}
              </p>
              <div className={styles.list}>
                {items.map((entry) => (
                  <SelectionHistoryCard
                    key={entry.id}
                    entry={entry}
                    seasons={seasons}
                    fragranceTypes={fragranceTypes}
                    notes={notes}
                    deleting={deletingId === entry.id}
                    onDelete={() => void handleDelete(entry.id)}
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
        </>
      ) : null}

      {tab === 'views' ? <ViewHistoryPanel /> : null}
      {tab === 'recommendations' ? <RecommendationHistoryPanel /> : null}
    </PageContainer>
  )
}
