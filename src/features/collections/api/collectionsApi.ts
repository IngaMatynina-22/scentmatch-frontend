import type {
  CollectionDetails,
  CollectionImportResult,
  CollectionSummary,
  CollectionWritePayload,
} from '@/features/collections/model/types'
import { httpRequest, httpRequestBlob } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export type CollectionsQuery = {
  page?: number
  pageSize?: number
}

export const collectionsApi = {
  /** GET /api/collections — requires auth */
  getList(
    query: CollectionsQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<CollectionSummary>> {
    return httpRequest<PagedResult<CollectionSummary>>({
      path: '/api/collections',
      query: {
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },

  /** GET /api/collections/{id} */
  getById(id: number, signal?: AbortSignal): Promise<CollectionDetails> {
    return httpRequest<CollectionDetails>({
      path: `/api/collections/${id}`,
      signal,
    })
  },

  /** POST /api/collections — 201 */
  create(payload: CollectionWritePayload, signal?: AbortSignal): Promise<CollectionSummary> {
    return httpRequest<CollectionSummary>({
      path: '/api/collections',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  /** PUT /api/collections/{id} */
  update(
    id: number,
    payload: CollectionWritePayload,
    signal?: AbortSignal,
  ): Promise<CollectionSummary> {
    return httpRequest<CollectionSummary>({
      path: `/api/collections/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },

  /** DELETE /api/collections/{id} — 204 */
  async remove(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/collections/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  /** POST /api/collections/{collectionId}/perfumes/{perfumeId} — 201 */
  async addPerfume(
    collectionId: number,
    perfumeId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    await httpRequest<null>({
      path: `/api/collections/${collectionId}/perfumes/${perfumeId}`,
      method: 'POST',
      signal,
    })
  },

  /** DELETE /api/collections/{collectionId}/perfumes/{perfumeId} — 204 */
  async removePerfume(
    collectionId: number,
    perfumeId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    await httpRequest<null>({
      path: `/api/collections/${collectionId}/perfumes/${perfumeId}`,
      method: 'DELETE',
      signal,
    })
  },

  /** GET /api/collections/export?format=json|csv */
  async exportFile(
    format: 'json' | 'csv' = 'json',
    signal?: AbortSignal,
  ): Promise<{ blob: Blob; fileName: string }> {
    const result = await httpRequestBlob({
      path: '/api/collections/export',
      query: { format },
      signal,
    })
    return {
      blob: result.blob,
      fileName:
        result.fileName ??
        `collections-export.${format === 'csv' ? 'csv' : 'json'}`,
    }
  },

  /** POST /api/collections/import?preview=true|false — multipart file */
  importFile(
    file: File,
    preview: boolean,
    signal?: AbortSignal,
  ): Promise<CollectionImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    return httpRequest<CollectionImportResult>({
      path: '/api/collections/import',
      method: 'POST',
      query: { preview },
      body: formData,
      signal,
    })
  },
}
