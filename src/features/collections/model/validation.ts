import {
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_NAME_MAX,
  type CollectionFormState,
} from '@/features/collections/model/types'

export type CollectionFormErrors = {
  name?: string
  description?: string
}

export function validateCollectionForm(form: CollectionFormState): CollectionFormErrors {
  const errors: CollectionFormErrors = {}
  const name = form.name.trim()
  const description = form.description.trim()

  if (!name) {
    errors.name = 'Назва обов’язкова.'
  } else if (name.length > COLLECTION_NAME_MAX) {
    errors.name = `Максимум ${COLLECTION_NAME_MAX} символів.`
  }

  if (description.length > COLLECTION_DESCRIPTION_MAX) {
    errors.description = `Максимум ${COLLECTION_DESCRIPTION_MAX} символів.`
  }

  return errors
}
