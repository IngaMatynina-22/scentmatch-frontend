import type { CollectionFormState } from '@/features/collections/model/types'
import {
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_NAME_MAX,
} from '@/features/collections/model/types'
import type { CollectionFormErrors } from '@/features/collections/model/validation'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import styles from './CollectionForm.module.css'

type CollectionFormProps = {
  title: string
  form: CollectionFormState
  fieldErrors: CollectionFormErrors
  formError: string | null
  submitting: boolean
  submitLabel: string
  onChange: (next: CollectionFormState) => void
  onSubmit: () => void
  onCancel?: () => void
}

export function CollectionForm({
  title,
  form,
  fieldErrors,
  formError,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  return (
    <form
      className={styles.root}
      onSubmit={(event) => {
        event.preventDefault()
        if (!submitting) onSubmit()
      }}
      noValidate
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={submitting}>
            Скасувати
          </Button>
        ) : null}
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <Input
        label="Назва"
        name="name"
        value={form.name}
        maxLength={COLLECTION_NAME_MAX}
        error={fieldErrors.name}
        disabled={submitting}
        required
        onChange={(event) => onChange({ ...form, name: event.target.value })}
      />

      <Textarea
        label="Опис"
        name="description"
        value={form.description}
        maxLength={COLLECTION_DESCRIPTION_MAX}
        rows={3}
        hint={`Необов’язково · до ${COLLECTION_DESCRIPTION_MAX} символів`}
        error={fieldErrors.description}
        disabled={submitting}
        onChange={(event) => onChange({ ...form, description: event.target.value })}
      />

      <div className={styles.actions}>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
