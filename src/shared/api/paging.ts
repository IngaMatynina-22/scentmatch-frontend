/** Matches ScentMatch.Application.Common.Models.PagedResult<T> */
export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
