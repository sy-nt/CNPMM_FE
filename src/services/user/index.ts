import { apiClient } from '@/services/api-client'
import type { ApiResponse } from '@/services/types'
import type { UpdateProfileRequest, UserProfile } from '@/services/user/types'

export const userApi = {
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/user/')
    return response.data
  },

  async updateCurrentUser(
    payload: UpdateProfileRequest,
  ): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      '/user/',
      payload,
    )
    return response.data
  },
}

export type { UpdateProfileRequest, UserProfile } from '@/services/user/types'
