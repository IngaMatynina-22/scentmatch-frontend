export type ReviewsByStatus = {
  pending: number
  approved: number
  rejected: number
}

export type CatalogGaps = {
  missingNotes: number
  missingSeasons: number
  missingImage: number
  missingPrice: number
}

export type AdminDashboard = {
  perfumeCount: number
  brandCount: number
  noteCount: number
  seasonCount: number
  fragranceTypeCount: number
  reviewsByStatus: ReviewsByStatus
  catalogGaps: CatalogGaps
  recentJobErrorCount: number
}

export type CatalogQualitySummary = {
  missingNotes: number
  missingSeasons: number
  missingImage: number
  invalidShopUrls: number
  missingIntensity: number
  missingBarcode: number
  suspectedDuplicates: number
}

export type CatalogQualityIssue = {
  perfumeId: number
  perfumeName: string
  brandName: string
  issueType: string
  message: string
}

export type CatalogQualityReport = {
  totalActivePerfumes: number
  issues: CatalogQualityIssue[]
  summary: CatalogQualitySummary
}

export type CatalogDuplicateItem = {
  perfumeId: number
  name: string
  brandName: string
  barcode: string | null
}

export type CatalogDuplicateGroup = {
  normalizedKey: string
  reason: string
  confidence: number
  items: CatalogDuplicateItem[]
}

export type CatalogImportRow = {
  name: string
  brandName: string
  fragranceTypeName?: string | null
  price?: number | null
  currency?: string | null
  barcode?: string | null
  imageUrl?: string | null
  description?: string | null
  intensity?: number | null
  noteNames?: string[]
  seasonNames?: string[]
}

export type CatalogImportRequest = {
  apply: boolean
  rows: CatalogImportRow[]
}

export type CatalogImportRowResult = {
  index: number
  status: string
  message: string | null
  perfumeId: number | null
  matchedBy: string | null
  isDuplicateCandidate: boolean
}

export type CatalogImportResult = {
  applied: boolean
  totalRows: number
  created: number
  updated: number
  skipped: number
  failed: number
  rows: CatalogImportRowResult[]
}

export type AdminAuditLog = {
  id: number
  adminUserId: number
  adminUserName: string | null
  action: string
  entityType: string
  entityId: string | null
  result: string
  details: string | null
  createdAt: string
}

export type BackgroundJobLog = {
  id: number
  jobName: string
  startedAt: string
  finishedAt: string | null
  status: string
  processedCount: number
  errorCount: number
  message: string | null
}

export type PriceTrackingIntegration = {
  enabled: boolean
  checkIntervalMinutes: number
  providerName: string
  providerConfigured: boolean
  lastSuccessAt: string | null
  lastErrorAt: string | null
  lastSuccessMessage: string | null
  lastErrorMessage: string | null
}

export type AdminIntegrations = {
  priceTracking: PriceTrackingIntegration
}
