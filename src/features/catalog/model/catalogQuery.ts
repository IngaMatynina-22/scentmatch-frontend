import {
  PERFUME_SORT_BY,
  SORT_ORDERS,
  type PerfumeQuery,
  type PerfumeSortBy,
  type SortOrder,
} from '@/entities/perfume'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const DEFAULT_SORT_BY: PerfumeSortBy = 'name'
const DEFAULT_SORT_ORDER: SortOrder = 'asc'

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function parseNonNegativeNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function parseIntInRange(
  value: string | null,
  min: number,
  max: number,
): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return undefined
  return parsed
}

function parseSortBy(value: string | null): PerfumeSortBy | undefined {
  if (!value) return undefined
  return (PERFUME_SORT_BY as readonly string[]).includes(value)
    ? (value as PerfumeSortBy)
    : undefined
}

function parseSortOrder(value: string | null): SortOrder | undefined {
  if (!value) return undefined
  return (SORT_ORDERS as readonly string[]).includes(value)
    ? (value as SortOrder)
    : undefined
}

export function parseCatalogQuery(params: URLSearchParams): PerfumeQuery {
  const search = params.get('search')?.trim() || undefined
  const gender = params.get('gender')?.trim() || undefined
  const concentration = params.get('concentration')?.trim() || undefined
  const noteIds = params.get('noteIds')?.trim() || undefined

  return {
    search,
    brandId: parsePositiveInt(params.get('brandId')),
    fragranceTypeId: parsePositiveInt(params.get('fragranceTypeId')),
    seasonId: parsePositiveInt(params.get('seasonId')),
    noteIds,
    minPrice: parseNonNegativeNumber(params.get('minPrice')),
    maxPrice: parseNonNegativeNumber(params.get('maxPrice')),
    minRating: parseNonNegativeNumber(params.get('minRating')),
    gender,
    concentration,
    minSweetness: parseIntInRange(params.get('minSweetness'), 0, 100),
    minFreshness: parseIntInRange(params.get('minFreshness'), 0, 100),
    minWoody: parseIntInRange(params.get('minWoody'), 0, 100),
    minSpicy: parseIntInRange(params.get('minSpicy'), 0, 100),
    sortBy: parseSortBy(params.get('sortBy')) ?? DEFAULT_SORT_BY,
    sortOrder: parseSortOrder(params.get('sortOrder')) ?? DEFAULT_SORT_ORDER,
    page: parsePositiveInt(params.get('page')) ?? DEFAULT_PAGE,
    pageSize: parseIntInRange(params.get('pageSize'), 1, 100) ?? DEFAULT_PAGE_SIZE,
  }
}

function setOptional(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined || value === '') {
    params.delete(key)
    return
  }
  params.set(key, String(value))
}

/** Serialize query for URL — omits defaults to keep links clean. */
export function serializeCatalogQuery(query: PerfumeQuery): URLSearchParams {
  const params = new URLSearchParams()

  setOptional(params, 'search', query.search?.trim() || undefined)
  setOptional(params, 'brandId', query.brandId)
  setOptional(params, 'fragranceTypeId', query.fragranceTypeId)
  setOptional(params, 'seasonId', query.seasonId)
  setOptional(params, 'noteIds', query.noteIds?.trim() || undefined)
  setOptional(params, 'minPrice', query.minPrice)
  setOptional(params, 'maxPrice', query.maxPrice)
  setOptional(params, 'minRating', query.minRating)
  setOptional(params, 'gender', query.gender?.trim() || undefined)
  setOptional(params, 'concentration', query.concentration?.trim() || undefined)
  setOptional(params, 'minSweetness', query.minSweetness)
  setOptional(params, 'minFreshness', query.minFreshness)
  setOptional(params, 'minWoody', query.minWoody)
  setOptional(params, 'minSpicy', query.minSpicy)

  if (query.sortBy && query.sortBy !== DEFAULT_SORT_BY) {
    params.set('sortBy', query.sortBy)
  }
  if (query.sortOrder && query.sortOrder !== DEFAULT_SORT_ORDER) {
    params.set('sortOrder', query.sortOrder)
  }
  if (query.page && query.page !== DEFAULT_PAGE) {
    params.set('page', String(query.page))
  }
  if (query.pageSize && query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(query.pageSize))
  }

  return params
}

export function catalogSearchString(query: PerfumeQuery): string {
  const params = serializeCatalogQuery(query)
  const text = params.toString()
  return text ? `?${text}` : ''
}

export function countActiveFilters(query: PerfumeQuery): number {
  let count = 0
  if (query.search?.trim()) count += 1
  if (query.brandId) count += 1
  if (query.fragranceTypeId) count += 1
  if (query.seasonId) count += 1
  if (query.noteIds?.trim()) count += 1
  if (query.minPrice !== undefined) count += 1
  if (query.maxPrice !== undefined) count += 1
  if (query.minRating !== undefined) count += 1
  if (query.gender?.trim()) count += 1
  if (query.concentration?.trim()) count += 1
  if (query.minSweetness !== undefined) count += 1
  if (query.minFreshness !== undefined) count += 1
  if (query.minWoody !== undefined) count += 1
  if (query.minSpicy !== undefined) count += 1
  return count
}

export function clearCatalogFilters(query: PerfumeQuery): PerfumeQuery {
  return {
    search: undefined,
    brandId: undefined,
    fragranceTypeId: undefined,
    seasonId: undefined,
    noteIds: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    gender: undefined,
    concentration: undefined,
    minSweetness: undefined,
    minFreshness: undefined,
    minWoody: undefined,
    minSpicy: undefined,
    sortBy: query.sortBy ?? DEFAULT_SORT_BY,
    sortOrder: query.sortOrder ?? DEFAULT_SORT_ORDER,
    page: DEFAULT_PAGE,
    pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
  }
}
