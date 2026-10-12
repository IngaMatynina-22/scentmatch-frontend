/** ScoreComponent — Application.Common.Scoring */
export type ScoreComponent = {
  key: string
  weight: number
  similarity: number
  contribution: number
  skippedDueToMissingData: boolean
}

/** Shared transparency fields returned with matching / similarity / recommendations */
export type ScoreBreakdown = {
  components: ScoreComponent[]
  positiveReasons: string[]
  mismatchReasons: string[]
  dataGaps: string[]
}
