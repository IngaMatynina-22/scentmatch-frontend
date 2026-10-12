import type { Brand, FragranceType, Note, Season } from '@/entities/perfume'
import type {
  AdminReview,
  AdminReviewQuery,
  BrandWritePayload,
  FragranceTypeWritePayload,
  NoteWritePayload,
  PerfumeDetails,
  PerfumeWritePayload,
  SeasonWritePayload,
} from '@/features/admin/model/types'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export const adminApi = {
  // —— Brands (list via public GET /api/brands) ——
  listBrands(signal?: AbortSignal): Promise<Brand[]> {
    return httpRequest<Brand[]>({ path: '/api/brands', signal })
  },
  createBrand(payload: BrandWritePayload, signal?: AbortSignal): Promise<Brand> {
    return httpRequest<Brand>({ path: '/api/admin/brands', method: 'POST', body: payload, signal })
  },
  updateBrand(id: number, payload: BrandWritePayload, signal?: AbortSignal): Promise<Brand> {
    return httpRequest<Brand>({
      path: `/api/admin/brands/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },
  async deleteBrand(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({ path: `/api/admin/brands/${id}`, method: 'DELETE', signal })
  },

  // —— Notes ——
  listNotes(signal?: AbortSignal): Promise<Note[]> {
    return httpRequest<Note[]>({ path: '/api/notes', signal })
  },
  createNote(payload: NoteWritePayload, signal?: AbortSignal): Promise<Note> {
    return httpRequest<Note>({ path: '/api/admin/notes', method: 'POST', body: payload, signal })
  },
  updateNote(id: number, payload: NoteWritePayload, signal?: AbortSignal): Promise<Note> {
    return httpRequest<Note>({
      path: `/api/admin/notes/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },
  async deleteNote(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({ path: `/api/admin/notes/${id}`, method: 'DELETE', signal })
  },

  // —— Seasons ——
  listSeasons(signal?: AbortSignal): Promise<Season[]> {
    return httpRequest<Season[]>({ path: '/api/seasons', signal })
  },
  createSeason(payload: SeasonWritePayload, signal?: AbortSignal): Promise<Season> {
    return httpRequest<Season>({
      path: '/api/admin/seasons',
      method: 'POST',
      body: payload,
      signal,
    })
  },
  updateSeason(id: number, payload: SeasonWritePayload, signal?: AbortSignal): Promise<Season> {
    return httpRequest<Season>({
      path: `/api/admin/seasons/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },
  async deleteSeason(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({ path: `/api/admin/seasons/${id}`, method: 'DELETE', signal })
  },

  // —— Fragrance types ——
  listFragranceTypes(signal?: AbortSignal): Promise<FragranceType[]> {
    return httpRequest<FragranceType[]>({ path: '/api/fragrance-types', signal })
  },
  createFragranceType(
    payload: FragranceTypeWritePayload,
    signal?: AbortSignal,
  ): Promise<FragranceType> {
    return httpRequest<FragranceType>({
      path: '/api/admin/fragrance-types',
      method: 'POST',
      body: payload,
      signal,
    })
  },
  updateFragranceType(
    id: number,
    payload: FragranceTypeWritePayload,
    signal?: AbortSignal,
  ): Promise<FragranceType> {
    return httpRequest<FragranceType>({
      path: `/api/admin/fragrance-types/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },
  async deleteFragranceType(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({
      path: `/api/admin/fragrance-types/${id}`,
      method: 'DELETE',
      signal,
    })
  },

  // —— Perfumes ——
  listPerfumes(
    query: { page?: number; pageSize?: number; search?: string } = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<PerfumeDetails>> {
    return httpRequest<PagedResult<PerfumeDetails>>({
      path: '/api/perfumes',
      query: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        search: query.search,
      },
      signal,
    })
  },
  getPerfume(id: number, signal?: AbortSignal): Promise<PerfumeDetails> {
    return httpRequest<PerfumeDetails>({ path: `/api/perfumes/${id}`, signal })
  },
  createPerfume(payload: PerfumeWritePayload, signal?: AbortSignal): Promise<PerfumeDetails> {
    return httpRequest<PerfumeDetails>({
      path: '/api/admin/perfumes',
      method: 'POST',
      body: payload,
      signal,
    })
  },
  updatePerfume(
    id: number,
    payload: PerfumeWritePayload,
    signal?: AbortSignal,
  ): Promise<PerfumeDetails> {
    return httpRequest<PerfumeDetails>({
      path: `/api/admin/perfumes/${id}`,
      method: 'PUT',
      body: payload,
      signal,
    })
  },
  async deletePerfume(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({ path: `/api/admin/perfumes/${id}`, method: 'DELETE', signal })
  },

  // —— Reviews moderation ——
  getReviews(
    query: AdminReviewQuery = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<AdminReview>> {
    return httpRequest<PagedResult<AdminReview>>({
      path: '/api/admin/reviews',
      query: {
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      },
      signal,
    })
  },
  approveReview(id: number, signal?: AbortSignal): Promise<AdminReview> {
    return httpRequest<AdminReview>({
      path: `/api/admin/reviews/${id}/approve`,
      method: 'PUT',
      signal,
    })
  },
  rejectReview(id: number, signal?: AbortSignal): Promise<AdminReview> {
    return httpRequest<AdminReview>({
      path: `/api/admin/reviews/${id}/reject`,
      method: 'PUT',
      signal,
    })
  },
  async deleteReview(id: number, signal?: AbortSignal): Promise<void> {
    await httpRequest<null>({ path: `/api/admin/reviews/${id}`, method: 'DELETE', signal })
  },
}
