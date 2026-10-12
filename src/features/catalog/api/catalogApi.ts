import type {
  Brand,
  FragranceType,
  Note,
  Perfume,
  PerfumeQuery,
  Season,
} from '@/entities/perfume'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

function toQueryRecord(
  query: PerfumeQuery,
): Record<string, string | number | boolean | null | undefined> {
  return {
    search: query.search,
    brandId: query.brandId,
    fragranceTypeId: query.fragranceTypeId,
    seasonId: query.seasonId,
    noteIds: query.noteIds,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minRating: query.minRating,
    gender: query.gender,
    concentration: query.concentration,
    minSweetness: query.minSweetness,
    minFreshness: query.minFreshness,
    minWoody: query.minWoody,
    minSpicy: query.minSpicy,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export const catalogApi = {
  /** GET /api/perfumes */
  getPerfumes(query: PerfumeQuery, signal?: AbortSignal): Promise<PagedResult<Perfume>> {
    return httpRequest<PagedResult<Perfume>>({
      path: '/api/perfumes',
      query: toQueryRecord(query),
      signal,
    })
  },

  /** GET /api/brands */
  getBrands(signal?: AbortSignal): Promise<Brand[]> {
    return httpRequest<Brand[]>({ path: '/api/brands', signal })
  },

  /** GET /api/notes */
  getNotes(signal?: AbortSignal): Promise<Note[]> {
    return httpRequest<Note[]>({ path: '/api/notes', signal })
  },

  /** GET /api/seasons */
  getSeasons(signal?: AbortSignal): Promise<Season[]> {
    return httpRequest<Season[]>({ path: '/api/seasons', signal })
  },

  /** GET /api/fragrance-types */
  getFragranceTypes(signal?: AbortSignal): Promise<FragranceType[]> {
    return httpRequest<FragranceType[]>({ path: '/api/fragrance-types', signal })
  },
}
