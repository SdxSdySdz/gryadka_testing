import { http } from './http'
import type { Order } from '../types'

export const ordersApi = {
  list: () =>
    http.get<Order[]>('/orders/').then((r) => r.data),

  detail: (id: number) =>
    http.get<Order>(`/orders/${id}/`).then((r) => r.data),

  create: (data: {
    delivery_method: string
    delivery_district: string
    delivery_interval: string
    is_urgent?: boolean
    payment_method: string
    address?: string
    comment: string
    promo_code: string
    items: { product_id: number; quantity: number; price_type: string }[]
  }) =>
    http.post<Order>('/orders/', data).then((r) => r.data),

  // Admin
  adminList: (params?: { status?: string }) =>
    http.get<Order[]>('/orders/admin/', { params }).then((r) => r.data),

  adminUpdateStatus: (id: number, status: string) =>
    http.patch<Order>(`/orders/admin/${id}/`, { status }).then((r) => r.data),
}
