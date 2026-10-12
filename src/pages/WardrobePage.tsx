import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  WARDROBE_SCENARIO_LABELS,
  WARDROBE_SCENARIOS,
  wardrobeApi,
  type WardrobeResponse,
  type WardrobeStats,
} from '@/features/wardrobe'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
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

function scenarioLabel(key: string): string {
  return WARDROBE_SCENARIO_LABELS[key] ?? key
}

export function WardrobePage() {
  const [data, setData] = useState<WardrobeResponse | null>(null)
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [filter, setFilter] = useState('')

  const [perfumeId, setPerfumeId] = useState('')
  const [scenarioKey, setScenarioKey] = useState<string>('Daily')
  const [collectionName, setCollectionName] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [wardrobe, wardrobeStats] = await Promise.all([
          wardrobeApi.get(controller.signal),
          wardrobeApi.getStats(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setData(wardrobe)
          setStats(wardrobeStats)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setData(null)
        setStats(null)
        setError(getApiErrorMessage(err, 'Не вдалося завантажити гардероб.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reload])

  async function handleAssign() {
    if (assigning) return
    const id = Number.parseInt(perfumeId, 10)
    if (!Number.isFinite(id) || id <= 0) {
      setAssignError('Вкажіть коректний ID парфуму.')
      return
    }
    setAssigning(true)
    setAssignError(null)
    setAssignSuccess(null)
    try {
      await wardrobeApi.assign({
        perfumeId: id,
        scenarioKey,
        collectionName: collectionName.trim() || null,
      })
      setAssignSuccess('Призначення збережено.')
      setPerfumeId('')
      setCollectionName('')
      setReload((v) => v + 1)
    } catch (err) {
      setAssignError(getApiErrorMessage(err, 'Не вдалося призначити парфум.'))
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(scenario: string, perfumeIdValue: number) {
    if (!window.confirm('Прибрати парфум із цього сценарію?')) return
    try {
      await wardrobeApi.removePerfume(scenario, perfumeIdValue)
      setReload((v) => v + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося видалити призначення.'))
    }
  }

  const scenarios = (data?.scenarios ?? []).filter(
    (group) => !filter || group.scenarioKey === filter,
  )

  return (
    <PageContainer
      title="Парфумерний гардероб"
      description="Аромати за сценаріями використання: робота, вечір, сезон тощо."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.collections} variant="ghost" size="sm">
          Колекції
        </ButtonLink>
        <ButtonLink to={ROUTES.catalog} variant="ghost" size="sm">
          Каталог
        </ButtonLink>
      </div>

      {stats && stats.scenarios.length > 0 ? (
        <div className={styles.stats}>
          {stats.scenarios.map((stat) => (
            <div key={stat.scenarioKey} className={styles.stat}>
              <div className={styles.statValue}>{stat.perfumeCount}</div>
              <div className={styles.statLabel}>
                {scenarioLabel(stat.scenarioKey)}
              </div>
              <p className={styles.meta}>
                колекцій: {stat.collectionCount}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          void handleAssign()
        }}
      >
        <h2 className={styles.cardTitle}>Призначити парфум сценарію</h2>
        <div className={styles.grid}>
          <Input
            label="ID парфуму"
            value={perfumeId}
            onChange={(e) => setPerfumeId(e.target.value)}
          />
          <Select
            label="Сценарій"
            value={scenarioKey}
            options={WARDROBE_SCENARIOS.map((key) => ({
              value: key,
              label: scenarioLabel(key),
            }))}
            onChange={(e) => setScenarioKey(e.target.value)}
          />
          <Input
            label="Назва колекції (необов’язково)"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>
        {assignError ? <p className={styles.error}>{assignError}</p> : null}
        {assignSuccess ? (
          <p className={styles.success}>{assignSuccess}</p>
        ) : null}
        <Button type="submit" variant="accent" loading={assigning}>
          Призначити
        </Button>
      </form>

      <div className={styles.chipRow}>
        <button
          type="button"
          className={!filter ? `${styles.chip} ${styles.chipActive}` : styles.chip}
          onClick={() => setFilter('')}
        >
          Усі
        </button>
        {WARDROBE_SCENARIOS.map((key) => (
          <button
            key={key}
            type="button"
            className={
              filter === key
                ? `${styles.chip} ${styles.chipActive}`
                : styles.chip
            }
            onClick={() => setFilter(key)}
          >
            {scenarioLabel(key)}
          </button>
        ))}
      </div>

      {loading ? <LoadingState label="Завантаження гардероба…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReload((v) => v + 1)}
        />
      ) : null}
      {!loading && !error && scenarios.length === 0 ? (
        <EmptyState
          title="Гардероб порожній"
          message="Призначте парфум сценарію або додайте аромати через колекції зі сценарієм."
        />
      ) : null}

      {!loading && !error
        ? scenarios.map((group) => (
            <section key={group.scenarioKey} className={styles.card}>
              <h2 className={styles.cardTitle}>
                {scenarioLabel(group.scenarioKey)} · {group.perfumeCount}
              </h2>
              {group.collections.map((collection) => (
                <div key={collection.id}>
                  <p className={styles.meta}>{collection.name}</p>
                  <ul className={styles.list}>
                    {collection.perfumes.map((perfume) => (
                      <li key={perfume.id} className={styles.actions}>
                        <Link
                          to={perfumeDetailsPath(perfume.id)}
                          className={styles.link}
                        >
                          {perfume.brand.name} — {perfume.name}
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void handleRemove(group.scenarioKey, perfume.id)
                          }
                        >
                          Прибрати
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))
        : null}
    </PageContainer>
  )
}
