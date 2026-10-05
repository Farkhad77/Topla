export interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  stadiumId: string
  userId: string
  userName: string
}

export interface ReviewCreatePayload {
  stadiumId: string
  rating: number
  comment: string
}

export interface ReviewUpdatePayload {
  rating: number
  comment: string
}
