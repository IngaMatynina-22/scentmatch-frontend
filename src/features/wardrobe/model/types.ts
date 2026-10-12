import type { Perfume } from '@/entities/perfume'

export const WARDROBE_SCENARIOS = [
  'Daily',
  'Work',
  'Evening',
  'Date',
  'Summer',
  'Winter',
  'Special',
  'Custom',
] as const

export type WardrobeScenarioKey = (typeof WARDROBE_SCENARIOS)[number]

export const WARDROBE_SCENARIO_LABELS: Record<string, string> = {
  Daily: 'Повсякденний',
  Work: 'Робота',
  Evening: 'Вечірній вихід',
  Date: 'Побачення',
  Summer: 'Літо',
  Winter: 'Зима',
  Special: 'Особливі події',
  Custom: 'Власний',
}

export type WardrobeCollection = {
  id: number
  name: string
  description: string | null
  perfumes: Perfume[]
}

export type WardrobeScenarioGroup = {
  scenarioKey: string
  perfumeCount: number
  collections: WardrobeCollection[]
}

export type WardrobeResponse = {
  scenarios: WardrobeScenarioGroup[]
}

export type WardrobeScenarioStat = {
  scenarioKey: string
  collectionCount: number
  perfumeCount: number
}

export type WardrobeStats = {
  scenarios: WardrobeScenarioStat[]
}

export type AssignWardrobeRequest = {
  perfumeId: number
  scenarioKey: string
  collectionName?: string | null
}
