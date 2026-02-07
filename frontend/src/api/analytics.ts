import { http } from './http'
import type { Analytics } from '../types'

export const analyticsApi = {
  get: (params?: { period?: string; date?: string }) =>
    http.get<Analytics>('/admin/analytics/', { params }).then((r) => r.data),
}
