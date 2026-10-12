export type OwnReview = {
  id: number
  perfumeId: number
  perfumeName: string | null
  user: { id: number; username: string }
  rating: number
  text: string | null
  status: string
  createdAt: string | null
  updatedAt: string | null
}

export type ReviewWritePayload = {
  rating: number
  text: string | null
}

export type OwnReviewsQuery = {
  sortBy?: string
  sortOrder?: string
  page?: number
  pageSize?: number
}
