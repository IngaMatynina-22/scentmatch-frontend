import { useRef, useState } from 'react'
import {
  matchingApi,
  validateTextMatchingForm,
  type ParsedTextCriteria,
  type MatchingResult,
} from '@/features/matching'
import { MatchingResults } from '@/features/matching/ui/MatchingResults'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from './TextMatchPage.module.css'

function CriteriaSummary({
  criteria,
  ambiguous,
}: {
  criteria: ParsedTextCriteria | null
  ambiguous: string[]
}) {
  if (!criteria) return null

  const preferred = criteria.preferredNotes ?? []
  const excluded = criteria.excludedNotes ?? []
  const rows: Array<{ label: string; value: string }> = []

  if (criteria.seasonName) rows.push({ label: 'Сезон', value: criteria.seasonName })
  if (criteria.fragranceTypeName) {
    rows.push({ label: 'Тип', value: criteria.fragranceTypeName })
  }
  if (criteria.minPrice != null || criteria.maxPrice != null) {
    const currency = criteria.currency ?? ''
    rows.push({
      label: 'Бюджет',
      value: `${criteria.minPrice ?? '—'} – ${criteria.maxPrice ?? '—'} ${currency}`.trim(),
    })
  }
  if (criteria.intensity != null) {
    rows.push({ label: 'Інтенсивність', value: String(criteria.intensity) })
  }
  if (criteria.concentration) {
    rows.push({ label: 'Концентрація', value: criteria.concentration })
  }
  if (criteria.gender) rows.push({ label: 'Gender', value: criteria.gender })
  if (preferred.length > 0) {
    rows.push({
      label: 'Бажані ноти',
      value: preferred.map((n) => n.name).join(', '),
    })
  }
  if (excluded.length > 0) {
    rows.push({
      label: 'Небажані ноти',
      value: excluded.map((n) => n.name).join(', '),
    })
  }

  if (rows.length === 0 && ambiguous.length === 0) {
    return (
      <p className={styles.hint}>
        Критерії не розпізнано. Спробуйте уточнити опис.
      </p>
    )
  }

  return (
    <div className={styles.criteria}>
      <h2 className={styles.criteriaTitle}>Розпізнані критерії</h2>
      {rows.length > 0 ? (
        <dl className={styles.criteriaList}>
          {rows.map((row) => (
            <div key={row.label} className={styles.criteriaRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {ambiguous.length > 0 ? (
        <div className={styles.ambiguous}>
          <p className={styles.ambiguousTitle}>Неоднозначні або нерозпізнані</p>
          <ul>
            {ambiguous.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function TextMatchPage() {
  const [text, setText] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [results, setResults] = useState<MatchingResult[]>([])
  const [criteria, setCriteria] = useState<ParsedTextCriteria | null>(null)
  const [ambiguous, setAmbiguous] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const lastTextRef = useRef<string | null>(null)

  async function runMatch(nextText: string) {
    if (submitting) return

    const validation = validateTextMatchingForm(nextText)
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors)
      setFormError(validation.formError)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setApiError(null)
    setSubmitting(true)
    lastTextRef.current = validation.request.text

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await matchingApi.matchText(
        validation.request,
        controller.signal,
      )
      if (!controller.signal.aborted) {
        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/a93378d8-d876-4c8d-aacd-a4cfef8f0ff5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'66d254'},body:JSON.stringify({sessionId:'66d254',runId:'post-fix',hypothesisId:'H',location:'TextMatchPage.tsx:matchText',message:'Text match API response',data:{textLen:validation.request.text.length,textPreview:validation.request.text.slice(0,80),itemCount:(response.items??[]).length,preferredNotes:(response.parsedCriteria?.preferredNotes??[]).map((n)=>n.name),excludedNotes:(response.parsedCriteria?.excludedNotes??[]).map((n)=>n.name),seasonName:response.parsedCriteria?.seasonName??null,fragranceTypeName:response.parsedCriteria?.fragranceTypeName??null,intensity:response.parsedCriteria?.intensity??null,ambiguous:response.ambiguousCriteria??[]},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setResults(response.items ?? [])
        setCriteria(response.parsedCriteria ?? null)
        setAmbiguous(response.ambiguousCriteria ?? [])
        setSubmitted(true)
      }
    } catch (error) {
      if (controller.signal.aborted) return
      // #region agent log
      fetch('http://127.0.0.1:7646/ingest/a93378d8-d876-4c8d-aacd-a4cfef8f0ff5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'66d254'},body:JSON.stringify({sessionId:'66d254',runId:'post-fix',hypothesisId:'H',location:'TextMatchPage.tsx:matchText-error',message:'Text match API error',data:{message:error instanceof Error?error.message:String(error)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setSubmitted(true)
      setResults([])
      setCriteria(null)
      setAmbiguous([])
      setApiError(getApiErrorMessage(error, 'Не вдалося виконати текстовий підбір.'))
      setFieldErrors(getFieldErrors(error))
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }
  }

  return (
    <PageContainer
      title="Текстовий підбір"
      description="Опишіть бажаний аромат звичайною мовою — система розпізнає критерії та підбере варіанти."
    >
      <div className={styles.toolbar}>
        <ButtonLink to={ROUTES.match} variant="ghost" size="sm">
          Критерії
        </ButtonLink>
        <ButtonLink to={ROUTES.matchGift} variant="ghost" size="sm">
          Подарунок
        </ButtonLink>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void runMatch(text)
        }}
      >
        <label className={styles.label} htmlFor="text-match-input">
          Опис аромату
        </label>
        <textarea
          id="text-match-input"
          className={[
            styles.textarea,
            fieldErrors.text ? styles.invalid : '',
          ]
            .filter(Boolean)
            .join(' ')}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          maxLength={2000}
          disabled={submitting}
          placeholder="Наприклад: Хочу теплий вечірній аромат із ваніллю, без виражених квіткових нот, до 100 євро"
          aria-invalid={fieldErrors.text ? true : undefined}
        />
        <div className={styles.metaRow}>
          <span className={styles.counter}>{text.trim().length} / 2000</span>
          {fieldErrors.text ? (
            <p className={styles.error} role="alert">
              {fieldErrors.text}
            </p>
          ) : null}
        </div>
        {formError ? (
          <p className={styles.error} role="alert">
            {formError}
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button type="submit" variant="accent" loading={submitting}>
            Підібрати
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => {
              setText('')
              setFieldErrors({})
              setFormError(null)
              setApiError(null)
              setResults([])
              setCriteria(null)
              setAmbiguous([])
              setSubmitted(false)
              lastTextRef.current = null
            }}
          >
            Очистити
          </Button>
        </div>
      </form>

      {submitting ? <LoadingState label="Розпізнаємо опис і підбираємо…" /> : null}

      {!submitting && apiError ? (
        <ErrorState
          title="Помилка підбору"
          message={apiError}
          onRetry={() => {
            const last = lastTextRef.current
            if (last) void runMatch(last)
          }}
        />
      ) : null}

      {!submitting && !apiError && submitted ? (
        <>
          <CriteriaSummary criteria={criteria} ambiguous={ambiguous} />
          <MatchingResults
            items={results}
            submitted={submitted}
            idleTitle=""
            idleMessage=""
            emptyTitle="Нічого не знайдено"
            emptyMessage="Спробуйте уточнити опис або змінити обмеження."
          />
        </>
      ) : null}
    </PageContainer>
  )
}
