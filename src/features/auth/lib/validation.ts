import type { LoginCredentials, RegisterPayload } from '@/features/auth/model/types'

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FieldErrors = Partial<Record<string, string>>

export function validateLogin(values: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(values.email.trim()) || values.email.length > 255) {
    errors.email = 'Email format is invalid.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length > 100) {
    errors.password = 'Password must not exceed 100 characters.'
  }

  return errors
}

export function validateRegister(values: RegisterPayload): FieldErrors {
  const errors: FieldErrors = {}
  const username = values.username.trim()
  const email = values.email.trim()

  if (!username) {
    errors.username = 'Username is required.'
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters.'
  } else if (username.length > 100) {
    errors.username = 'Username must not exceed 100 characters.'
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Username contains invalid characters.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email) || email.length > 255) {
    errors.email = 'Email format is invalid.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (values.password.length > 100) {
    errors.password = 'Password must not exceed 100 characters.'
  }

  if (values.firstName && values.firstName.length > 100) {
    errors.firstName = 'First name must not exceed 100 characters.'
  }

  if (values.lastName && values.lastName.length > 100) {
    errors.lastName = 'Last name must not exceed 100 characters.'
  }

  return errors
}
