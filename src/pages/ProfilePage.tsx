import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import {
  profileApi,
  type UpdateProfilePayload,
  type UserProfile,
} from '@/features/profile/api/profileApi'
import { getApiErrorMessage, getFieldErrors } from '@/shared/api/errorMessage'
import { ROUTES } from '@/shared/constants/routes'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { Card } from '@/shared/ui/Card'
import { ErrorState } from '@/shared/ui/ErrorState'
import formStyles from '@/shared/ui/FormStack.module.css'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { PageContainer } from '@/shared/ui/PageContainer'

export function ProfilePage() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await profileApi.get(controller.signal)
        if (!controller.signal.aborted) {
          setProfile(data)
          setUsername(data.username)
          setFirstName(data.firstName ?? '')
          setLastName(data.lastName ?? '')
          setAvatarUrl(data.avatarUrl ?? '')
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(err, 'Не вдалося завантажити профіль.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [reloadToken])

  async function handleLogout() {
    await logout()
    navigate(ROUTES.home, { replace: true })
  }

  async function handleSave() {
    if (saving) return
    if (!username.trim()) {
      setFieldErrors({ username: 'Username обов’язковий.' })
      return
    }
    setSaving(true)
    setFormError(null)
    setFieldErrors({})
    setSuccess(null)
    const payload: UpdateProfilePayload = {
      username: username.trim(),
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    }
    try {
      const updated = await profileApi.update(payload)
      setProfile(updated)
      setSuccess('Профіль збережено.')
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setFormError(getApiErrorMessage(err, 'Не вдалося зберегти профіль.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer title="Профіль" description="Дані з /api/profile та сесії.">
      {loading ? <LoadingState label="Завантаження профілю…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Помилка"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && profile ? (
        <Card padding="lg">
          <div className={formStyles.root}>
            <div>
              <p className="text-label">Email</p>
              <p className="text-body">{profile.email}</p>
            </div>

            <div>
              <p className="text-label">Ролі (сесія)</p>
              <div className={formStyles.inline}>
                {(user?.roles ?? []).map((role) => (
                  <Badge key={role} tone={role === 'Admin' ? 'accent' : 'neutral'}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {isAdmin ? (
              <p className="text-caption">
                Доступна <Link to={ROUTES.admin.perfumes}>адмін-зона</Link>.
              </p>
            ) : null}

            {formError ? <p className="text-caption" style={{ color: 'var(--color-danger)' }}>{formError}</p> : null}
            {success ? <p className="text-caption" style={{ color: 'var(--color-accent-hover)' }}>{success}</p> : null}

            <Input
              label="Username"
              value={username}
              error={fieldErrors.username}
              disabled={saving}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Input
              label="Ім’я"
              value={firstName}
              error={fieldErrors.firstName}
              disabled={saving}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Input
              label="Прізвище"
              value={lastName}
              error={fieldErrors.lastName}
              disabled={saving}
              onChange={(event) => setLastName(event.target.value)}
            />
            <Input
              label="Avatar URL"
              value={avatarUrl}
              error={fieldErrors.avatarUrl}
              disabled={saving}
              onChange={(event) => setAvatarUrl(event.target.value)}
            />

            <Button type="button" loading={saving} disabled={saving} onClick={() => void handleSave()}>
              Зберегти профіль
            </Button>

            <div className={formStyles.inline}>
              <ButtonLink to={ROUTES.preferences} size="sm" variant="accent">
                Уподобання
              </ButtonLink>
              <ButtonLink to={ROUTES.favorites} size="sm" variant="ghost">
                Обране
              </ButtonLink>
              <ButtonLink to={ROUTES.collections} size="sm" variant="ghost">
                Колекції
              </ButtonLink>
              <ButtonLink to={ROUTES.history} size="sm" variant="ghost">
                Історія
              </ButtonLink>
              <ButtonLink to={ROUTES.myReviews} size="sm" variant="ghost">
                Мої відгуки
              </ButtonLink>
            </div>

            <Button type="button" variant="ghost" onClick={() => void handleLogout()}>
              Вийти
            </Button>
          </div>
        </Card>
      ) : null}
    </PageContainer>
  )
}
