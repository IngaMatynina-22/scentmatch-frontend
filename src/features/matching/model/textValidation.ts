import type { TextMatchingRequest } from '@/features/matching/model/types'

const MIN_LENGTH = 1
const MAX_LENGTH = 2000
const MAX_RESULTS = 50

export function validateTextMatchingForm(text: string, maxResults = 20): {
  ok: true
  request: TextMatchingRequest
} | {
  ok: false
  fieldErrors: Record<string, string>
  formError: string | null
} {
  const trimmed = text.trim()
  const fieldErrors: Record<string, string> = {}

  if (trimmed.length < MIN_LENGTH) {
    fieldErrors.text = 'Опишіть бажаний аромат.'
  } else if (trimmed.length > MAX_LENGTH) {
    fieldErrors.text = `Опис не може перевищувати ${MAX_LENGTH} символів.`
  }

  if (maxResults < 1 || maxResults > MAX_RESULTS) {
    fieldErrors.maxResults = `Кількість результатів: від 1 до ${MAX_RESULTS}.`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
      formError: 'Перевірте опис перед відправленням.',
    }
  }

  return {
    ok: true,
    request: {
      text: trimmed,
      maxResults,
    },
  }
}
