export type UserProfile = {
  email: string
  firstName?: string | null
  id: string
  imageUrl?: string | null
  isActive?: boolean
  lastName?: string | null
}

export type UpdateProfileRequest = {
  firstName?: string
  imageUrl?: string
  lastName?: string
  password?: string
}
