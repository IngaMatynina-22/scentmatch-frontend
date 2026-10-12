import { useEffect, useState } from 'react'
import type { FragranceType, Note, Season } from '@/entities/perfume'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import {
  createEmptyPreferencesForm,
  hasConfiguredPreferences,
  preferencesApi,
  preferencesToForm,
  validatePreferencesForm,
  type PreferencesFormState,
  type UserPreferences,
} from '@/features/preferences'
import { PreferencesForm } from '@/features/preferences/ui/PreferencesForm'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './PreferencesPage.module.css'

type Dictionaries = {
  seasons: Season[]
  fragranceTypes: FragranceType[]
  notes: Note[]
}

export function PreferencesPage() {
  const [dictionaries, setDictionaries] = useState<Dictionaries>({
    seasons: [],
    fragranceTypes: [],
    notes: [],
  })
  const [dictLoading, setDictLoading] = useState(true)
  const [dictError, setDictError] = useState<string | null>(null)
  const [dictReload, setDictReload] = useState(0)

  const [saved, setSaved] = useState<UserPreferences | null>(null)
  const [form, setForm] = useState<PreferencesFormState>(() => createEmptyPreferencesForm())
  const [prefsLoading, setPrefsLoading] = useState(true)
  const [prefsError, setPrefsError] = useState<string | null>(null)
  const [prefsReload, setPrefsReload] = useState(0)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    const controller = new AbortController()

    async function loadPreferences() {
      setPrefsLoading(true)
      setPrefsError(null)
      try {
        const prefs = await preferencesApi.get(controller.signal)
        if (!controller.signal.aborted) {
          setSaved(prefs)
          setForm(preferencesToForm(prefs))
          setSuccessMessage(null)
          setFormError(null)
          setFieldErrors({})
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setPrefsError(getApiErrorMessage(error, 'Не вдалося завантажити уподобання.'))
      } finally {
        if (!controller.signal.aborted) {
          setPrefsLoading(false)
        }
      }
    }

    void loadPreferences()
    return () => controller.abort()
  }, [prefsReload])

  async function handleSubmit() {
    if (submitting) return

    const validation = validatePreferencesForm(form)
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      setFormError(validation.formError)
      setSuccessMessage(null)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setSuccessMessage(null)
    setSubmitting(true)

    try {
      const updated = await preferencesApi.update(validation.request)
      setSaved(updated)
      setForm(preferencesToForm(updated))
      setSuccessMessage('Уподобання збережено.')
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Не вдалося зберегти уподобання.'))
      setFieldErrors(getFieldErrors(error))
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    if (saved) {
      setForm(preferencesToForm(saved))
    } else {
      setForm(createEmptyPreferencesForm())
    }
    setFieldErrors({})
    setFormError(null)
    setSuccessMessage(null)
  }

  const loading = dictLoading || prefsLoading
  const configured = saved ? hasConfiguredPreferences(saved) : false

  return (
    <PageContainer
      title="Уподобання"
      description="Сезон, тип, ноти, ароматичні шкали та ціновий діапазон — основа для рекомендацій."
    >
      {loading ? <LoadingState label="Завантаження уподобань…" /> : null}

      {!loading && dictError ? (
        <ErrorState
          title="Довідники недоступні"
          message={dictError}
          onRetry={() => setDictReload((value) => value + 1)}
        />
      ) : null}

      {!loading && !dictError && prefsError ? (
        <ErrorState
          title="Не вдалося завантажити уподобання"
          message={prefsError}
          onRetry={() => setPrefsReload((value) => value + 1)}
        />
      ) : null}

      {!loading && !dictError && !prefsError ? (
        <div className={styles.stack}>
          {!configured ? (
            <EmptyState
              title="Уподобання ще не заповнені"
              message="Оберіть критерії нижче та збережіть — після цього рекомендації зможуть підлаштуватися під вас."
            />
          ) : null}

          <PreferencesForm
            form={form}
            seasons={dictionaries.seasons}
            fragranceTypes={dictionaries.fragranceTypes}
            notes={dictionaries.notes}
            fieldErrors={fieldErrors}
            formError={formError}
            successMessage={successMessage}
            submitting={submitting}
            onChange={(next) => {
              setForm(next)
              setSuccessMessage(null)
            }}
            onSubmit={() => void handleSubmit()}
            onReset={handleReset}
          />

          <div className={styles.links}>
            <ButtonLink to={ROUTES.recommendations} variant="ghost">
              До рекомендацій
            </ButtonLink>
            <ButtonLink to={ROUTES.match} variant="ghost">
              До підбору
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
