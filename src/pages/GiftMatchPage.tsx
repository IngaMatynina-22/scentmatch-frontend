import { useEffect, useRef, useState } from 'react'
import type { FragranceType, Note, Season } from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import {
  createEmptyGiftForm,
  matchingApi,
  validateGiftMatchingForm,
  type GiftMatchingFormState,
  type GiftMatchingRequest,
  type MatchingResult,
} from '@/features/matching'
import { MatchingResults } from '@/features/matching/ui/MatchingResults'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import { Select } from '@/shared/ui/Select'
import styles from './GiftMatchPage.module.css'

type Dictionaries = {
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
}

export function GiftMatchPage() {
  const [dictionaries, setDictionaries] = useState<Dictionaries>({
    seasons: [],
    fragranceTypes: [],
    notes: [],
  })
  const [dictLoading, setDictLoading] = useState(true)
  const [dictError, setDictError] = useState<string | null>(null)
  const [dictReload, setDictReload] = useState(0)

  const [form, setForm] = useState<GiftMatchingFormState>(() => createEmptyGiftForm())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [results, setResults] = useState<MatchingResult[]>([])
  const [occasionLabel, setOccasionLabel] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastRequestRef = useRef<GiftMatchingRequest | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDictionaries() {
      setDictLoading(true)
      setDictError(null)
      try {
        const [seasons, fragranceTypes, notes] = await Promise.all([
          catalogApi.getSeasons(controller.signal),
          catalogApi.getFragranceTypes(controller.signal),
          catalogApi.getNotes(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setDictionaries({ seasons, fragranceTypes, notes })
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setDictError(getApiErrorMessage(error, 'Не вдалося завантажити довідники.'))
      } finally {
        if (!controller.signal.aborted) {
          setDictLoading(false)
        }
      }
    }

    void loadDictionaries()
    return () => controller.abort()
  }, [dictReload])

  function patch(partial: Partial<GiftMatchingFormState>) {
    setForm((current) => ({ ...current, ...partial }))
  }

  function toggleNote(list: 'preferredNoteIds' | 'excludedNoteIds', noteId: number) {
    const current = form[list]
    const next = current.includes(noteId)
      ? current.filter((id) => id !== noteId)
      : [...current, noteId]
    patch({ [list]: next })
  }

  async function runMatch(request?: GiftMatchingRequest) {
    if (submitting) return

    let payload = request
    if (!payload) {
      const validation = validateGiftMatchingForm(form)
      if (!validation.ok) {
        setFieldErrors(validation.fieldErrors)
        setFormError(validation.formError)
        return
      }
      payload = validation.request
    }

    setFieldErrors({})
    setFormError(null)
    setApiError(null)
    setSubmitting(true)
    lastRequestRef.current = payload

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await matchingApi.matchGift(payload, controller.signal)
      if (!controller.signal.aborted) {
        setResults(response.items ?? [])
        setOccasionLabel(response.occasion ?? payload.occasion ?? null)
        setSubmitted(true)
      }
    } catch (error) {
      if (controller.signal.aborted) return
      setSubmitted(true)
      setResults([])
      setApiError(getApiErrorMessage(error, 'Не вдалося підібрати подарунок.'))
      setFieldErrors(getFieldErrors(error))
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }
  }

  return (
    <PageContainer
      title="Підбір подарунка"
      description="Окремий сценарій для подарунка іншій людині. Результати не вважаються вашими особистими вподобаннями."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.match} variant="ghost" size="sm">
          Особистий підбір
        </ButtonLink>
        <ButtonLink to={ROUTES.matchText} variant="ghost" size="sm">
          Текстовий підбір
        </ButtonLink>
      </div>

      <p className={styles.notice} role="note">
        Подарунковий підбір зберігається в історії зі сценарієм «Gift» і не впливає на
        персоналізацію вашого профілю.
      </p>

      {dictLoading ? <LoadingState label="Завантаження довідників…" /> : null}

      {!dictLoading && dictError ? (
        <ErrorState
          title="Довідники недоступні"
          message={dictError}
          onRetry={() => setDictReload((value) => value + 1)}
        />
      ) : null}

      {!dictLoading && !dictError ? (
        <div className={styles.layout}>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault()
              void runMatch()
            }}
          >
            <h2 className={styles.formTitle}>Критерії подарунка</h2>
            {formError ? (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            ) : null}

            <div className={styles.grid}>
              <Input
                label="Мін. ціна"
                type="number"
                inputMode="decimal"
                value={form.minPrice}
                error={fieldErrors.minPrice}
                disabled={submitting}
                onChange={(event) => patch({ minPrice: event.target.value })}
              />
              <Input
                label="Макс. ціна"
                type="number"
                inputMode="decimal"
                value={form.maxPrice}
                error={fieldErrors.maxPrice}
                disabled={submitting}
                onChange={(event) => patch({ maxPrice: event.target.value })}
              />
              <Input
                label="Валюта"
                value={form.currency}
                error={fieldErrors.currency}
                disabled={submitting}
                maxLength={8}
                onChange={(event) => patch({ currency: event.target.value })}
              />
              <Input
                label="Привід"
                value={form.occasion}
                error={fieldErrors.occasion}
                disabled={submitting}
                maxLength={100}
                placeholder="День народження, ювілей…"
                onChange={(event) => patch({ occasion: event.target.value })}
              />
              <Select
                label="Сезон"
                value={form.seasonId}
                error={fieldErrors.seasonId}
                disabled={submitting}
                placeholder="Не обрано"
                options={dictionaries.seasons.map((season) => ({
                  value: String(season.id),
                  label: season.name,
                }))}
                onChange={(event) => patch({ seasonId: event.target.value })}
              />
              <Select
                label="Тип аромату"
                value={form.fragranceTypeId}
                error={fieldErrors.fragranceTypeId}
                disabled={submitting}
                placeholder="Не обрано"
                options={dictionaries.fragranceTypes.map((type) => ({
                  value: String(type.id),
                  label: type.name,
                }))}
                onChange={(event) => patch({ fragranceTypeId: event.target.value })}
              />
              <Input
                label="Інтенсивність (0–100)"
                type="number"
                value={form.intensity}
                error={fieldErrors.intensity}
                disabled={submitting}
                onChange={(event) => patch({ intensity: event.target.value })}
              />
              <Input
                label="Gender"
                value={form.gender}
                error={fieldErrors.gender}
                disabled={submitting}
                maxLength={30}
                onChange={(event) => patch({ gender: event.target.value })}
              />
            </div>

            <section className={styles.notes}>
              <h3 className={styles.notesTitle}>
                Бажані ноти
                {form.preferredNoteIds.length > 0
                  ? ` · ${form.preferredNoteIds.length}`
                  : ''}
              </h3>
              {fieldErrors.preferredNoteIds ? (
                <p className={styles.formError}>{fieldErrors.preferredNoteIds}</p>
              ) : null}
              <div className={styles.noteList} role="group" aria-label="Бажані ноти">
                {dictionaries.notes.map((note) => {
                  const checked = form.preferredNoteIds.includes(note.id)
                  return (
                    <label key={`pref-${note.id}`} className={styles.noteItem}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting}
                        onChange={() => toggleNote('preferredNoteIds', note.id)}
                      />
                      <span>{note.name}</span>
                    </label>
                  )
                })}
              </div>
            </section>

            <section className={styles.notes}>
              <h3 className={styles.notesTitle}>
                Небажані ноти
                {form.excludedNoteIds.length > 0
                  ? ` · ${form.excludedNoteIds.length}`
                  : ''}
              </h3>
              {fieldErrors.excludedNoteIds ? (
                <p className={styles.formError}>{fieldErrors.excludedNoteIds}</p>
              ) : null}
              <div className={styles.noteList} role="group" aria-label="Небажані ноти">
                {dictionaries.notes.map((note) => {
                  const checked = form.excludedNoteIds.includes(note.id)
                  return (
                    <label key={`excl-${note.id}`} className={styles.noteItem}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting}
                        onChange={() => toggleNote('excludedNoteIds', note.id)}
                      />
                      <span>{note.name}</span>
                    </label>
                  )
                })}
              </div>
            </section>

            <div className={styles.actions}>
              <Button type="submit" variant="accent" loading={submitting}>
                Підібрати подарунок
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setForm(createEmptyGiftForm())
                  setFieldErrors({})
                  setFormError(null)
                  setApiError(null)
                  setResults([])
                  setSubmitted(false)
                  setOccasionLabel(null)
                  lastRequestRef.current = null
                }}
              >
                Скинути
              </Button>
            </div>
          </form>

          <div className={styles.results}>
            {occasionLabel ? (
              <p className={styles.occasion}>Привід: {occasionLabel}</p>
            ) : null}

            {submitting ? <LoadingState label="Підбираємо подарунок…" /> : null}

            {!submitting && apiError ? (
              <ErrorState
                title="Помилка підбору"
                message={apiError}
                onRetry={() => {
                  const last = lastRequestRef.current
                  if (last) void runMatch(last)
                }}
              />
            ) : null}

            {!submitting && !apiError ? (
              <MatchingResults
                items={results}
                submitted={submitted}
                idleTitle="Результати подарунка"
                idleMessage="Заповніть критерії та натисніть «Підібрати подарунок»."
                emptyTitle="Підходящих подарунків не знайдено"
                emptyMessage="Змініть бюджет, ноти або сезон і спробуйте знову."
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
