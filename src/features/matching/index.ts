export { matchingApi } from '@/features/matching/api/matchingApi'
export {
  createEmptyMatchingForm,
  MATCHING_SCALE_FIELDS,
  type GiftMatchingRequest,
  type GiftMatchingResponse,
  type MatchingFormState,
  type MatchingRequest,
  type MatchingResponse,
  type MatchingResult,
  type MatchingScaleKey,
  type NamedId,
  type ParsedTextCriteria,
  type TextMatchingRequest,
  type TextMatchingResponse,
} from '@/features/matching/model/types'
export { validateMatchingForm } from '@/features/matching/model/validation'
export {
  createEmptyGiftForm,
  validateGiftMatchingForm,
  type GiftMatchingFormState,
} from '@/features/matching/model/giftValidation'
export { validateTextMatchingForm } from '@/features/matching/model/textValidation'
export {
  GIFT_PREVIEW_COUNT,
  clearGiftMatchSession,
  readGiftMatchSession,
  saveGiftMatchSession,
  type GiftMatchSessionSnapshot,
} from '@/features/matching/model/giftMatchSession'
export { MatchingResults } from '@/features/matching/ui/MatchingResults'
