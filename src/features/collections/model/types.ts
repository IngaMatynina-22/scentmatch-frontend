import type { Perfume } from '@/entities/perfume'

/** CollectionDto */
export type CollectionSummary = {
  id: number
  name: string
  description: string | null
  perfumeCount: number
  createdAt: string | null
  updatedAt: string | null
}

/** CollectionDetailsDto */
export type CollectionDetails = {
  id: number
  name: string
  description: string | null
  perfumeCount: number
  perfumes: Perfume[]
  createdAt: string | null
  updatedAt: string | null
}

/** CreateCollectionRequest / UpdateCollectionRequest */
export type CollectionWritePayload = {
  name: string
  description: string | null
}

/** CollectionImportResult */
export type CollectionImportResult = {
  preview: boolean
  imported: number
  skipped: number
  duplicates: number
  unknownPerfumes: number[]
  errors: string[]
}

export const COLLECTION_IMPORT_MAX_BYTES = 1_048_576

export type CollectionFormState = {
  name: string
  description: string
}

export const COLLECTION_NAME_MAX = 200
export const COLLECTION_DESCRIPTION_MAX = 2000

export function emptyCollectionForm(): CollectionFormState {
  return { name: '', description: '' }
}

export function collectionToForm(collection: {
  name: string
  description: string | null
}): CollectionFormState {
  return {
    name: collection.name,
    description: collection.description ?? '',
  }
}

export function formToPayload(form: CollectionFormState): CollectionWritePayload {
  const name = form.name.trim()
  const description = form.description.trim()
  return {
    name,
    description: description.length > 0 ? description : null,
  }
}
