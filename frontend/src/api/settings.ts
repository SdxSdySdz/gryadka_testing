import { http } from './http'
import type { ShopSettings } from '../types'

export const settingsApi = {
  getPublic: () =>
    http.get<ShopSettings>('/settings/').then((r) => r.data),

  // Admin
  getShopSettings: () =>
    http.get<{ min_order_sum: string }>('/settings/admin/').then((r) => r.data),

  updateShopSettings: (data: { min_order_sum: number }) =>
    http.patch('/settings/admin/', data).then((r) => r.data),

  // Payment methods
  getPaymentMethods: () =>
    http.get('/settings/admin/payment-methods/').then((r) => r.data),
  createPaymentMethod: (data: { name: string }) =>
    http.post('/settings/admin/payment-methods/', data).then((r) => r.data),
  updatePaymentMethod: (id: number, data: any) =>
    http.patch(`/settings/admin/payment-methods/${id}/`, data).then((r) => r.data),
  deletePaymentMethod: (id: number) =>
    http.delete(`/settings/admin/payment-methods/${id}/`),

  // Delivery methods
  getDeliveryMethods: () =>
    http.get('/settings/admin/delivery-methods/').then((r) => r.data),
  createDeliveryMethod: (data: { name: string }) =>
    http.post('/settings/admin/delivery-methods/', data).then((r) => r.data),
  updateDeliveryMethod: (id: number, data: any) =>
    http.patch(`/settings/admin/delivery-methods/${id}/`, data).then((r) => r.data),
  deleteDeliveryMethod: (id: number) =>
    http.delete(`/settings/admin/delivery-methods/${id}/`),

  // Delivery districts
  getDeliveryDistricts: () =>
    http.get('/settings/admin/delivery-districts/').then((r) => r.data),
  createDeliveryDistrict: (data: { name: string }) =>
    http.post('/settings/admin/delivery-districts/', data).then((r) => r.data),
  deleteDeliveryDistrict: (id: number) =>
    http.delete(`/settings/admin/delivery-districts/${id}/`),

  // Delivery intervals
  getDeliveryIntervals: () =>
    http.get('/settings/admin/delivery-intervals/').then((r) => r.data),
  createDeliveryInterval: (data: { label: string }) =>
    http.post('/settings/admin/delivery-intervals/', data).then((r) => r.data),
  deleteDeliveryInterval: (id: number) =>
    http.delete(`/settings/admin/delivery-intervals/${id}/`),
}
