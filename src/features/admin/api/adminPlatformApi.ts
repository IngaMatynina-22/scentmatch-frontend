import type {
  AdminAuditLog,
  AdminDashboard,
  AdminIntegrations,
  BackgroundJobLog,
  CatalogDuplicateGroup,
  CatalogImportRequest,
  CatalogImportResult,
  CatalogQualityReport,
} from '@/features/admin/model/platformTypes'
import { httpRequest } from '@/shared/api/httpClient'
import type { PagedResult } from '@/shared/api/paging'

export const adminPlatformApi = {
  getDashboard(signal?: AbortSignal): Promise<AdminDashboard> {
    return httpRequest<AdminDashboard>({
      path: '/api/admin/dashboard',
      signal,
    })
  },

  getCatalogQuality(signal?: AbortSignal): Promise<CatalogQualityReport> {
    return httpRequest<CatalogQualityReport>({
      path: '/api/admin/catalog/quality',
      signal,
    })
  },

  getDuplicates(signal?: AbortSignal): Promise<CatalogDuplicateGroup[]> {
    return httpRequest<CatalogDuplicateGroup[]>({
      path: '/api/admin/catalog/duplicates',
      signal,
    })
  },

  importCatalog(
    payload: CatalogImportRequest,
    signal?: AbortSignal,
  ): Promise<CatalogImportResult> {
    return httpRequest<CatalogImportResult>({
      path: '/api/admin/catalog/import',
      method: 'POST',
      body: payload,
      signal,
    })
  },

  getAuditLogs(
    query: {
      page?: number
      pageSize?: number
      action?: string
      entityType?: string
      adminUserId?: number
    } = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<AdminAuditLog>> {
    return httpRequest<PagedResult<AdminAuditLog>>({
      path: '/api/admin/audit-logs',
      query: {
        page: query.page,
        pageSize: query.pageSize,
        action: query.action,
        entityType: query.entityType,
        adminUserId: query.adminUserId,
      },
      signal,
    })
  },

  getJobs(
    query: { page?: number; pageSize?: number } = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<BackgroundJobLog>> {
    return httpRequest<PagedResult<BackgroundJobLog>>({
      path: '/api/admin/jobs',
      query: { page: query.page, pageSize: query.pageSize },
      signal,
    })
  },

  getIntegrations(signal?: AbortSignal): Promise<AdminIntegrations> {
    return httpRequest<AdminIntegrations>({
      path: '/api/admin/integrations',
      signal,
    })
  },
}
