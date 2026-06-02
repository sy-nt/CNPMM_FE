import { apiRequest } from '#/lib/api/client'

export function getHealthCheck(signal?: AbortSignal): Promise<unknown> {
  return apiRequest('/health-check/', { method: 'GET', signal })
}
