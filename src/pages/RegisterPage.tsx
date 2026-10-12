import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { validateRegister, type FieldErrors } from '@/features/auth/lib/validation'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import formStyles from '@/shared/ui/FormStack.module.css'
import { Input } from '@/shared/ui/Input'
import { PageContainer } from '@/shared/ui/PageContainer'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    }

    const clientErrors = validateRegister(payload)
    setFieldErrors(clientErrors)
    setFormError(null)

    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      await register(payload)
      navigate(ROUTES.home, { replace: true })
    } catch (error) {
      const apiFields = getFieldErrors(error)
      if (Object.keys(apiFields).length > 0) {
        setFieldErrors(apiFields)
      }
      setFormError(getApiErrorMessage(error, 'Не вдалося зареєструватися.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      narrow
      title="Реєстрація"
      description="Створіть акаунт, щоб зберігати обране, отримувати рекомендації та персональний підбір."
    >
      <Card padding="lg">
        <form className={formStyles.root} onSubmit={(event) => void handleSubmit(event)} noValidate>
          <Input
            label="Ім’я користувача"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={fieldErrors.username}
            hint="Літери, цифри, крапка, _ або - (мін. 3 символи)."
            disabled={submitting}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            disabled={submitting}
          />
          <Input
            label="Пароль"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            hint="Мінімум 8 символів."
            disabled={submitting}
          />
          <Input
            label="Ім’я (необов’язково)"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={fieldErrors.firstName}
            disabled={submitting}
          />
          <Input
            label="Прізвище (необов’язково)"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={fieldErrors.lastName}
            disabled={submitting}
          />

          {formError ? (
            <p className="text-error" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" variant="accent" fullWidth loading={submitting}>
            Створити акаунт
          </Button>
        </form>
      </Card>

      <p className="text-muted">
        Уже є акаунт? <Link to={ROUTES.login}>Увійти</Link>
      </p>
    </PageContainer>
  )
}
