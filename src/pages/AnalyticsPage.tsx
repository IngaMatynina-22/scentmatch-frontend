import { useEffect, useState } from 'react'
import {
  analyticsApi,
  type NamedCount,
  type PreferenceAnalytics,
} from '@/features/analytics'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './AnalyticsPage.module.css'

function CountList({
  title,
  items,
  emptyHint,
}: {
  title: string
  items: NamedCount[] | null | undefined
  emptyHint: string
}) {
  const list = items ?? []
  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {list.length === 0 ? (
        <p className={styles.muted}>{emptyHint}</p>
      ) : (
        <ul className={styles.countList}>
          {list.map((item) => (
            <li key={`${item.id ?? item.name}-${item.count}`}>
              <span>{item.name}</span>
              <span className={styles.count}>{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function AnalyticsPage() {
  const [data, setData] = useState<PreferenceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await analyticsApi.getPreferences(controller.signal)
        if (!controller.signal.aborted) {
          setData(response)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setData(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити аналітику.'))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => controller.abort()
  }, [reload])

  async function handleReset() {
    if (resetting) return
    setResetting(true)
    setResetMessage(null)
    try {
      const response = await analyticsApi.resetPersonalization({
        useBehavioralSignals: false,
      })
      setResetMessage(
        `Персоналізацію скинуто ${formatDate(response.personalizationResetAt) ?? ''}. Поведінкові сигнали: вимкнено. Історія, оцінки та колекції не видаляються.`,
      )
      setConfirmReset(false)
      setReload((value) => value + 1)
    } catch (err) {
      setResetMessage(
        getApiErrorMessage(err, 'Не вдалося скинути персоналізацію.'),
      )
    } finally {
      setResetting(false)
    }
  }

  const hasAnySignal =
    data &&
    ((data.reviewRatings?.ratedCount ?? 0) > 0 ||
      (data.journalRatings?.ratedCount ?? 0) > 0 ||
      (data.favorites?.count ?? 0) > 0 ||
      (data.collections?.totalPerfumes ?? 0) > 0 ||
      (data.personalSelectionHistory?.count ?? 0) > 0 ||
      data.explicitPreferences != null)

  return (
    <PageContainer
      title="Аналітика вподобань"
      description="Огляд сигналів, з яких будується персоналізація. Дані лише ті, що повертає API."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.preferences} variant="ghost" size="sm">
          Уподобання
        </ButtonLink>
        <ButtonLink to={ROUTES.history} variant="ghost" size="sm">
          Історія
        </ButtonLink>
        <ButtonLink to={ROUTES.recommendations} variant="ghost" size="sm">
          Рекомендації
        </ButtonLink>
      </div>

      {loading ? <LoadingState label="Завантаження аналітики…" /> : null}

      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && data && !hasAnySignal ? (
        <EmptyState
          title="Ще немає даних для аналітики"
          message="Додайте уподобання, оцінки, обране, колекції або виконайте підбір — тоді тут з’являться розподіли."
          action={
            <ButtonLink to={ROUTES.preferences} variant="accent">
              Налаштувати уподобання
            </ButtonLink>
          }
        />
      ) : null}

      {!loading && !error && data ? (
        <div className={styles.grid}>
          {data.explicitPreferences ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Явні уподобання</h3>
              <dl className={styles.meta}>
                {data.explicitPreferences.preferredSeason ? (
                  <div>
                    <dt>Сезон</dt>
                    <dd>{data.explicitPreferences.preferredSeason.name}</dd>
                  </div>
                ) : null}
                {data.explicitPreferences.preferredFragranceType ? (
                  <div>
                    <dt>Тип</dt>
                    <dd>
                      {data.explicitPreferences.preferredFragranceType.name}
                    </dd>
                  </div>
                ) : null}
                {data.explicitPreferences.minPrice != null ||
                data.explicitPreferences.maxPrice != null ? (
                  <div>
                    <dt>Ціна</dt>
                    <dd>
                      {data.explicitPreferences.minPrice ?? '—'} –{' '}
                      {data.explicitPreferences.maxPrice ?? '—'}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {(data.explicitPreferences.preferredNotes?.length ?? 0) > 0 ? (
                <p className={styles.muted}>
                  Ноти:{' '}
                  {data.explicitPreferences.preferredNotes!
                    .map((n) => n.name)
                    .join(', ')}
                </p>
              ) : (
                <p className={styles.muted}>Улюблені ноти не задані.</p>
              )}
            </section>
          ) : null}

          {data.reviewRatings ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Оцінки у відгуках</h3>
              <p className={styles.statLine}>
                Оцінок: {data.reviewRatings.ratedCount}
                {data.reviewRatings.averageRating != null
                  ? ` · середня ${data.reviewRatings.averageRating}`
                  : ''}
              </p>
              <CountList
                title="Топ нот"
                items={data.reviewRatings.topNotes}
                emptyHint="Недостатньо оцінок для нот."
              />
              <CountList
                title="Топ типів"
                items={data.reviewRatings.topFragranceTypes}
                emptyHint="Недостатньо оцінок для типів."
              />
            </section>
          ) : null}

          {data.journalRatings ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Оцінки в щоденнику</h3>
              <p className={styles.statLine}>
                Записів з оцінкою: {data.journalRatings.ratedCount}
                {data.journalRatings.averageRating != null
                  ? ` · середня ${data.journalRatings.averageRating}`
                  : ''}
              </p>
              <CountList
                title="Топ нот"
                items={data.journalRatings.topNotes}
                emptyHint="Ще немає журнальних оцінок за нотами."
              />
            </section>
          ) : null}

          {data.favorites ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Обране</h3>
              <p className={styles.statLine}>Кількість: {data.favorites.count}</p>
              <CountList
                title="Ноти в обраному"
                items={data.favorites.topNotes}
                emptyHint="Додайте аромати в обране."
              />
              <CountList
                title="Типи в обраному"
                items={data.favorites.topFragranceTypes}
                emptyHint="Немає даних за типами."
              />
            </section>
          ) : null}

          {data.collections ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Колекції</h3>
              <p className={styles.statLine}>
                Колекцій: {data.collections.totalCollections} · парфумів:{' '}
                {data.collections.totalPerfumes}
              </p>
              <CountList
                title="За сценаріями"
                items={data.collections.countsByScenario}
                emptyHint="Сценарії колекцій відсутні."
              />
            </section>
          ) : null}

          {data.personalSelectionHistory ? (
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Історія особистих підборів</h3>
              <p className={styles.statLine}>
                Записів: {data.personalSelectionHistory.count}
              </p>
              <CountList
                title="Сезони"
                items={data.personalSelectionHistory.topSeasons}
                emptyHint="Немає сезонних сигналів."
              />
              <CountList
                title="Типи"
                items={data.personalSelectionHistory.topFragranceTypes}
                emptyHint="Немає сигналів за типами."
              />
              <CountList
                title="Ноти"
                items={data.personalSelectionHistory.topNotes}
                emptyHint="Немає сигналів за нотами."
              />
            </section>
          ) : null}

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Персоналізація</h3>
            <p className={styles.statLine}>
              Поведінкові сигнали:{' '}
              {data.personalization.useBehavioralSignals
                ? 'увімкнено'
                : 'вимкнено'}
            </p>
            {data.personalization.personalizationResetAt ? (
              <p className={styles.muted}>
                Останнє скидання:{' '}
                {formatDate(data.personalization.personalizationResetAt)}
              </p>
            ) : (
              <p className={styles.muted}>Скидань ще не було.</p>
            )}

            {!confirmReset ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setConfirmReset(true)}
              >
                Скинути персоналізацію
              </Button>
            ) : (
              <div className={styles.confirm}>
                <p>
                  Буде скинуто лише похідний стан персоналізації (поведінкові
                  сигнали). Історія підборів, оцінки, обране та колекції
                  залишаться.
                </p>
                <div className={styles.confirmActions}>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    loading={resetting}
                    onClick={() => void handleReset()}
                  >
                    Підтвердити скидання
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={resetting}
                    onClick={() => setConfirmReset(false)}
                  >
                    Скасувати
                  </Button>
                </div>
              </div>
            )}
            {resetMessage ? (
              <p className={styles.resetMessage} role="status">
                {resetMessage}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </PageContainer>
  )
}
