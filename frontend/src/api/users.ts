import { http } from './http'
import type { User } from '../types'

export const usersApi = {
  me: () =>
    http.get<User>('/users/me/').then((r) => r.data),

  updateMe: (data: Partial<User>) =>
    http.patch<User>('/users/me/', data).then((r) => r.data),

  // Admin
  adminList: () =>
    http.get<User[]>('/users/admin/').then((r) => r.data),

  adminAdd: (telegram_id: number) =>
    http.post<User>('/users/admin/add/', { telegram_id, is_admin: true }).then((r) => r.data),

  adminRemove: (telegram_id: number) =>
    http.delete(`/users/admin/${telegram_id}/remove/`).then((r) => r.data),
}
