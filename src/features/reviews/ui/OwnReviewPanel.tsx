import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'
import { reviewsApi } from '@/features/reviews/api/reviewsApi'
import type { OwnReview } from '@/features/reviews/model/types'
import { ApiError } from '@/shared/api/errors'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { loginPathWithReturn } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import styles from './OwnReviewPanel.module.css'

type OwnReviewPanelProps = {
  perfumeId: number
  onChanged?: () => void
}

export function OwnReviewPanel({ perfumeId, onChanged }: OwnReviewPanelProps) {
  const { isAuthenticated } = useAuth()
  const [mine, setMine] = useState<OwnReview | null>(null)
  const [loading, setLoading] = useState(isAuthenticated)
  const [rating, setRating] = useState('5')
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setMine(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const review = await reviewsApi.getMineForPerfume(perfumeId, controller.signal)
        if (!controller.signal.aborted) {
          setMine(review)
          setRating(String(review.rating))
          setText(review.text ?? '')
          setEditing(false)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setMine(null)
          setEditing(true)
        } else {
          setError(getApiErrorMessage(err, 'Не вдалося завантажити ваш відгук.'))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [perfumeId, isAuthenticated, reloadToken])

  if (!isAuthenticated) {
    const returnTo = `${window.location.pathname}${window.location.search}`
    return (
      <section className={styles.root}>
        <h3 className={styles.title}>Ваш відгук</h3>
        <p className={styles.hint}>Увійдіть, щоб залишити оцінку.</p>
        <ButtonLink to={loginPathWithReturn(returnTo)} size="sm">
          Увійти
        </ButtonLink>
      </section>
    )
  }

  async function handleSubmit() {
    const ratingValue = Number.parseInt(rating, 10)
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setFieldErrors({ rating: 'Оцінка від 1 до 5.' })
      return
    }
    if (submitting) return

    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    setSuccess(null)
    const payload = { rating: ratingValue, text: text.trim() || null }

    try {
      const saved = mine
        ? await reviewsApi.update(mine.id, payload)
        : await reviewsApi.create(perfumeId, payload)
      setMine(saved)
      setEditing(false)
      setSuccess(mine ? 'Відгук оновлено (може знову очікувати модерації).' : 'Відгук надіслано на модерацію.')
      onChanged?.()
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getApiErrorMessage(err, 'Не вдалося зберегти відгук.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!mine || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await reviewsApi.remove(mine.id)
      setMine(null)
      setRating('5')
      setText('')
      setEditing(true)
      setSuccess('Відгук видалено.')
      onChanged?.()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося видалити відгук.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.root} aria-labelledby="own-review-title">
      <h3 id="own-review-title" className={styles.title}>
        Ваш відгук
      </h3>

      {loading ? <p className={styles.hint}>Завантаження…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}{' '}
          <button type="button" className={styles.linkish} onClick={() => setReloadToken((v) => v + 1)}>
            Повторити
          </button>
        </p>
      ) : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      {!loading && mine && !editing ? (
        <div className={styles.preview}>
          <p className={styles.meta}>
            ★ {mine.rating} · {mine.status}
          </p>
          {mine.text ? <p className={styles.text}>{mine.text}</p> : <p className={styles.hint}>Без тексту</p>}
          <div className={styles.actions}>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Редагувати
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              loading={submitting}
              onClick={() => void handleDelete()}
            >
              Видалити
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && editing ? (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <Input
            label="Оцінка (1–5)"
            type="number"
            min={1}
            max={5}
            value={rating}
            error={fieldErrors.rating}
            disabled={submitting}
            onChange={(event) => setRating(event.target.value)}
          />
          <Textarea
            label="Текст"
            value={text}
            error={fieldErrors.text}
            disabled={submitting}
            onChange={(event) => setText(event.target.value)}
          />
          <div className={styles.actions}>
            <Button type="submit" size="sm" loading={submitting} disabled={submitting}>
              {mine ? 'Зберегти' : 'Надіслати'}
            </Button>
            {mine ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setEditing(false)
                  setRating(String(mine.rating))
                  setText(mine.text ?? '')
                }}
              >
                Скасувати
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  )
}
