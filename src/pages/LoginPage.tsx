import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { validateLogin, type FieldErrors } from '@/features/auth/lib/validation'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { getSafeInternalPath } from '@/shared/lib/safeReturnUrl'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import formStyles from '@/shared/ui/FormStack.module.css'
import { Input } from '@/shared/ui/Input'
import { PageContainer } from '@/shared/ui/PageContainer'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = getSafeInternalPath(searchParams.get('returnUrl'), ROUTES.home)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const credentials = { email: email.trim(), password }
    const clientErrors = validateLogin(credentials)
    setFieldErrors(clientErrors)
    setFormError(null)

    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      await login(credentials)
      navigate(returnUrl, { replace: true })
    } catch (error) {
      const apiFields = getFieldErrors(error)
      if (Object.keys(apiFields).length > 0) {
        setFieldErrors(apiFields)
      }
      setFormError(getApiErrorMessage(error, 'Не вдалося увійти. Перевірте дані.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer narrow title="Вхід" description="Увійдіть, щоб користуватися персональними можливостями ScentMatch.">
      <Card padding="lg">
        <form className={formStyles.root} onSubmit={(event) => void handleSubmit(event)} noValidate>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            disabled={submitting}
          />

          {formError ? (
            <p className="text-error" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={submitting}>
            Увійти
          </Button>
        </form>
      </Card>

      {searchParams.get('returnUrl') ? (
        <p className="text-caption">
          Після входу відкриється: <span className="text-meta">{returnUrl}</span>
        </p>
      ) : null}

      <p className="text-muted">
        Немає акаунта? <Link to={ROUTES.register}>Зареєструватися</Link>
      </p>
    </PageContainer>
  )
}
