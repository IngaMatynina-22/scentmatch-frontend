import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  blindComparisonApi,
  type BlindComparisonResults,
  type BlindComparisonSession,
} from '@/features/blind-comparison'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { perfumeDetailsPath, ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './platform.module.css'

const SESSION_STORAGE_KEY = 'scentmatch.blindComparison.sessionId'

type Step = 'select' | 'rate' | 'results'

export function BlindComparisonPage() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<Step>('select')
  const [idsInput, setIdsInput] = useState('')
  const [session, setSession] = useState<BlindComparisonSession | null>(null)
  const [results, setResults] = useState<BlindComparisonResults | null>(null)
  const [ratings, setRatings] = useState<
    Record<string, { rating: string; comment: string }>
  >({})
  const [winnerLabel, setWinnerLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const fromQuery = searchParams.get('sessionId')
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    const sessionId = fromQuery || stored
    if (!sessionId) return

    const controller = new AbortController()
    async function resume() {
      setBusy(true)
      setError(null)
      try {
        const existing = await blindComparisonApi.getSession(
          sessionId!,
          controller.signal,
        )
        if (controller.signal.aborted) return
        setSession(existing)
        sessionStorage.setItem(SESSION_STORAGE_KEY, existing.id)
        const map: Record<string, { rating: string; comment: string }> = {}
        for (const slot of existing.slots) {
          map[slot.label] = {
            rating: slot.rating != null ? String(slot.rating) : '',
            comment: slot.comment ?? '',
          }
        }
        setRatings(map)
        if (existing.status.toLowerCase().includes('complete')) {
          const revealed = await blindComparisonApi.getResults(
            existing.id,
            controller.signal,
          )
          if (!controller.signal.aborted) {
            setResults(revealed)
            setStep('results')
          }
        } else {
          setStep('rate')
        }
      } catch (err) {
        if (controller.signal.aborted) return
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
        setError(
          getApiErrorMessage(
            err,
            'Не вдалося відновити сесію. Створіть нову або перевірте доступ.',
          ),
        )
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }
    void resume()
    return () => controller.abort()
  }, [searchParams])

  async function handleCreate() {
    if (busy) return
    const perfumeIds = idsInput
      .split(/[\s,;]+/)
      .map((part) => Number.parseInt(part, 10))
      .filter((id) => Number.isFinite(id) && id > 0)
    if (perfumeIds.length < 2) {
      setError('Оберіть щонайменше два парфуми (ID через кому).')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await blindComparisonApi.create({ perfumeIds })
      setSession(created)
      sessionStorage.setItem(SESSION_STORAGE_KEY, created.id)
      const map: Record<string, { rating: string; comment: string }> = {}
      for (const slot of created.slots) {
        map[slot.label] = { rating: '', comment: '' }
      }
      setRatings(map)
      setStep('rate')
      setInfo('Сесію створено. Назви приховано до завершення.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося створити сесію.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveRatings() {
    if (!session || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await blindComparisonApi.rate(session.id, {
        ratings: session.slots.map((slot) => ({
          label: slot.label,
          rating: ratings[slot.label]?.rating
            ? Number.parseInt(ratings[slot.label].rating, 10)
            : null,
          comment: ratings[slot.label]?.comment?.trim() || null,
        })),
      })
      setSession(updated)
      setInfo('Оцінки збережено.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося зберегти оцінки.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    if (!session || busy) return
    setBusy(true)
    setError(null)
    try {
      const revealed = await blindComparisonApi.complete(session.id, {
        winnerLabel: winnerLabel || null,
      })
      setResults(revealed)
      setStep('results')
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося завершити сесію.'))
    } finally {
      setBusy(false)
    }
  }

  function startNew() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
    setResults(null)
    setRatings({})
    setWinnerLabel('')
    setIdsInput('')
    setStep('select')
    setError(null)
    setInfo(null)
  }

  return (
    <PageContainer
      title="Сліпе порівняння"
      description="Оцінюйте анонімні варіанти. Назви та бренди з’являться лише після завершення сесії."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.compare} variant="ghost" size="sm">
          Звичайне порівняння
        </ButtonLink>
        {step !== 'select' ? (
          <Button type="button" variant="ghost" size="sm" onClick={startNew}>
            Нова сесія
          </Button>
        ) : null}
      </div>

      {busy && !session && step === 'select' ? (
        <LoadingState label="Завантаження сесії…" />
      ) : null}
      {error ? <ErrorState title="Помилка" message={error} /> : null}
      {info ? <p className={styles.success}>{info}</p> : null}

      {step === 'select' ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            void handleCreate()
          }}
        >
          <h2 className={styles.cardTitle}>Крок 1 · Оберіть парфуми</h2>
          <Input
            label="ID парфумів (через кому)"
            value={idsInput}
            onChange={(e) => setIdsInput(e.target.value)}
            hint="Наприклад: 12, 45, 78"
          />
          <Button type="submit" variant="accent" loading={busy}>
            Створити сліпу сесію
          </Button>
        </form>
      ) : null}

      {step === 'rate' && session ? (
        <div className={styles.list}>
          <p className={styles.meta}>
            Сесія {session.id.slice(0, 8)}… · статус {session.status} · діє до{' '}
            {new Date(session.expiresAt).toLocaleString('uk-UA')}
          </p>
          {session.slots.map((slot) => (
            <div key={slot.label} className={styles.slot}>
              <h3 className={styles.cardTitle}>Варіант {slot.label}</h3>
              <Input
                label="Оцінка"
                type="number"
                value={ratings[slot.label]?.rating ?? ''}
                onChange={(e) =>
                  setRatings((current) => ({
                    ...current,
                    [slot.label]: {
                      rating: e.target.value,
                      comment: current[slot.label]?.comment ?? '',
                    },
                  }))
                }
              />
              <label>
                Коментар
                <textarea
                  className={styles.textarea}
                  value={ratings[slot.label]?.comment ?? ''}
                  onChange={(e) =>
                    setRatings((current) => ({
                      ...current,
                      [slot.label]: {
                        rating: current[slot.label]?.rating ?? '',
                        comment: e.target.value,
                      },
                    }))
                  }
                />
              </label>
            </div>
          ))}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              loading={busy}
              onClick={() => void handleSaveRatings()}
            >
              Зберегти оцінки
            </Button>
          </div>
          <div className={styles.form}>
            <SelectWinner
              slots={session.slots.map((s) => s.label)}
              value={winnerLabel}
              onChange={setWinnerLabel}
            />
            <Button
              type="button"
              variant="accent"
              loading={busy}
              onClick={() => void handleComplete()}
            >
              Завершити та розкрити
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'results' && results ? (
        <div className={styles.list}>
          <p className={styles.meta}>
            Завершено
            {results.winnerLabel ? ` · переможець: ${results.winnerLabel}` : ''}
          </p>
          {results.slots.map((slot) => (
            <div key={slot.label} className={styles.card}>
              <p className={styles.meta}>Варіант {slot.label}</p>
              {slot.perfume ? (
                <Link
                  to={perfumeDetailsPath(slot.perfumeId)}
                  className={styles.link}
                >
                  {slot.perfume.brand.name} — {slot.perfume.name}
                </Link>
              ) : (
                <p className={styles.link}>Парфум #{slot.perfumeId}</p>
              )}
              <p className={styles.meta}>
                Оцінка: {slot.rating ?? '—'}
                {slot.comment ? ` · ${slot.comment}` : ''}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </PageContainer>
  )
}

function SelectWinner({
  slots,
  value,
  onChange,
}: {
  slots: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      Переможець (опційно)
      <select
        className={styles.textarea}
        style={{ minHeight: 'auto' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Не обрано</option>
        {slots.map((label) => (
          <option key={label} value={label}>
            Варіант {label}
          </option>
        ))}
      </select>
    </label>
  )
}
