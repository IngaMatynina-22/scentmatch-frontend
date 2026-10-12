import type { BarcodeLookupResult } from '@/features/barcode/model/types'
import { httpRequest } from '@/shared/api/httpClient'

export const barcodeApi = {
  /** GET /api/perfumes/by-barcode/{code} */
  lookup(code: string, signal?: AbortSignal): Promise<BarcodeLookupResult> {
    return httpRequest<BarcodeLookupResult>({
      path: `/api/perfumes/by-barcode/${encodeURIComponent(code)}`,
      signal,
    })
  },
}
