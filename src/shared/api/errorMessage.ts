import { ApiError } from '@/shared/api/errors'

type ValidationPayload = {
  errors?: Record<string, string[] | string>
  title?: string
  message?: string
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK') {
      return 'Не вдалося з’єднатися з сервером. Перевірте, що API запущено.'
    }

    if (typeof error.details === 'object' && error.details !== null) {
      const details = error.details as ValidationPayload
      if (details.errors) {
        const first = Object.values(details.errors)[0]
        if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
        if (typeof first === 'string') return first
      }
      if (typeof details.message === 'string' && details.message.trim()) {
        return details.message
      }
      if (typeof details.title === 'string' && details.title.trim()) {
        return details.title
      }
    }

    if (error.message.trim()) return error.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || typeof error.details !== 'object' || error.details === null) {
    return {}
  }

  const details = error.details as ValidationPayload
  if (!details.errors) return {}

  const mapped: Record<string, string> = {}
  for (const [key, value] of Object.entries(details.errors)) {
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1)
    if (Array.isArray(value) && typeof value[0] === 'string') {
      mapped[normalizedKey] = value[0]
    } else if (typeof value === 'string') {
      mapped[normalizedKey] = value
    }
  }
  return mapped
}
