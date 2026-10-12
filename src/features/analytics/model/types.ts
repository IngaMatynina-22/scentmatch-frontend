/** PreferenceAnalyticsDto and nested sections */

export type NamedEntity = {
  id: number
  name: string
}

export type NamedCount = {
  id: number | null
  name: string
  count: number
}

export type ExplicitPreferencesSection = {
  preferredSeason: NamedEntity | null
  preferredFragranceType: NamedEntity | null
  preferredNotes: NamedEntity[] | null
  sweetness: number | null
  freshness: number | null
  woody: number | null
  spicy: number | null
  citrus: number | null
  floral: number | null
  fruity: number | null
  powdery: number | null
  smoky: number | null
  oriental: number | null
  minPrice: number | null
  maxPrice: number | null
}

export type RatingSignalsSection = {
  ratedCount: number
  averageRating: number | null
  topNotes: NamedCount[] | null
  topFragranceTypes: NamedCount[] | null
}

export type FavoritesSection = {
  count: number
  topNotes: NamedCount[] | null
  topFragranceTypes: NamedCount[] | null
}

export type CollectionsSection = {
  totalCollections: number
  totalPerfumes: number
  countsByScenario: NamedCount[] | null
}

export type SelectionHistorySection = {
  count: number
  topSeasons: NamedCount[] | null
  topFragranceTypes: NamedCount[] | null
  topNotes: NamedCount[] | null
}

export type PersonalizationState = {
  useBehavioralSignals: boolean
  personalizationResetAt: string | null
}

export type PreferenceAnalytics = {
  explicitPreferences: ExplicitPreferencesSection | null
  reviewRatings: RatingSignalsSection | null
  journalRatings: RatingSignalsSection | null
  favorites: FavoritesSection | null
  collections: CollectionsSection | null
  personalSelectionHistory: SelectionHistorySection | null
  personalization: PersonalizationState
}

export type ResetPersonalizationRequest = {
  useBehavioralSignals?: boolean
}

export type ResetPersonalizationResponse = {
  personalizationResetAt: string
  useBehavioralSignals: boolean
}
