import { useEffect, useRef, useState } from 'react'
import type { FragranceType, Note, Season } from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import {
  createEmptyMatchingForm,
  matchingApi,
  validateMatchingForm,
  type MatchingFormState,
  type MatchingRequest,
  type MatchingResult,
} from '@/features/matching'
import { MatchingForm } from '@/features/matching/ui/MatchingForm'
import { MatchingResults } from '@/features/matching/ui/MatchingResults'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './MatchPage.module.css'

type Dictionaries = {
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
}

export function MatchPage() {
  const [dictionaries, setDictionaries] = useState<Dictionaries>({
    seasons: [],
    fragranceTypes: [],
    notes: [],
  })
  const [dictLoading, setDictLoading] = useState(true)
  const [dictError, setDictError] = useState<string | null>(null)
  const [dictReload, setDictReload] = useState(0)

  const [form, setForm] = useState<MatchingFormState>(() => createEmptyMatchingForm())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const [results, setResults] = useState<MatchingResult[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const lastRequestRef = useRef<MatchingRequest | null>(null)

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

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  async function runMatch() {
    if (submitting) return

    const validation = validateMatchingForm(form)
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      setFormError(validation.formError)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setApiError(null)
    setSubmitting(true)
    lastRequestRef.current = validation.request

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await matchingApi.match(validation.request, controller.signal)
      if (!controller.signal.aborted) {
        setResults(response.items)
        setSubmitted(true)
      }
    } catch (error) {
      if (controller.signal.aborted) return
      setSubmitted(true)
      setResults([])
      setApiError(getApiErrorMessage(error, 'Не вдалося виконати підбір.'))
      setFieldErrors(getFieldErrors(error))
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }
  }

  async function retryLastRequest() {
    const last = lastRequestRef.current
    if (!last || submitting) return

    setApiError(null)
    setSubmitting(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await matchingApi.match(last, controller.signal)
      if (!controller.signal.aborted) {
        setResults(response.items)
        setSubmitted(true)
      }
    } catch (error) {
      if (controller.signal.aborted) return
      setApiError(getApiErrorMessage(error, 'Не вдалося виконати підбір.'))
      setFieldErrors(getFieldErrors(error))
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }
  }

  function handleReset() {
    setForm(createEmptyMatchingForm())
    setFieldErrors({})
    setFormError(null)
    setApiError(null)
    setResults([])
    setSubmitted(false)
    lastRequestRef.current = null
  }

  return (
    <PageContainer
      title="Персональний підбір"
      description="Оберіть сезон, тип, ноти, шкали та ціновий діапазон — отримаєте ранжований список з оцінкою відповідності. Результат автоматично зберігається в історії."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.matchText} variant="ghost" size="sm">
          Текстовий підбір
        </ButtonLink>
        <ButtonLink to={ROUTES.matchGift} variant="ghost" size="sm">
          Подарунок
        </ButtonLink>
        <ButtonLink to={ROUTES.history} variant="ghost" size="sm">
          Історія підборів
        </ButtonLink>
      </div>

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
          <MatchingForm
            form={form}
            seasons={dictionaries.seasons}
            fragranceTypes={dictionaries.fragranceTypes}
            notes={dictionaries.notes}
            fieldErrors={fieldErrors}
            formError={formError}
            submitting={submitting}
            onChange={setForm}
            onSubmit={() => void runMatch()}
            onReset={handleReset}
          />

          <div className={styles.results}>
            {submitting ? <LoadingState label="Підбираємо парфуми…" /> : null}

            {!submitting && apiError ? (
              <ErrorState
                title="Помилка підбору"
                message={apiError}
                onRetry={() => void retryLastRequest()}
                action={
                  <Button type="button" variant="ghost" onClick={handleReset}>
                    Скинути форму
                  </Button>
                }
              />
            ) : null}

            {!submitting && !apiError ? (
              <MatchingResults items={results} submitted={submitted} />
            ) : null}
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
