import { http } from './http'
import type { Product, Category } from '../types'

export const productsApi = {
  list: (params?: { category?: number; tag?: string; search?: string; in_stock?: string }) =>
    http.get<Product[]>('/products/', { params }).then((r) => r.data),

  detail: (id: number) =>
    http.get<Product>(`/products/${id}/`).then((r) => r.data),

  // Admin
  adminList: () =>
    http.get<Product[]>('/products/admin/').then((r) => r.data),

  adminCreate: (data: FormData) =>
    http.post<Product>('/products/admin/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  adminUpdate: (id: number, data: FormData) =>
    http.patch<Product>(`/products/admin/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  adminDelete: (id: number) =>
    http.delete(`/products/admin/${id}/`),

  adminDeleteImage: (imageId: number) =>
    http.delete(`/products/admin/images/${imageId}/`),

  adminBulk: (ids: number[], action: string, category_id?: number) =>
    http.post('/products/admin/bulk/', { ids, action, category_id }).then((r) => r.data),
}

export const categoriesApi = {
  list: () =>
    http.get<Category[]>('/categories/').then((r) => r.data),

  // Admin
  adminList: () =>
    http.get<Category[]>('/categories/admin/').then((r) => r.data),

  adminCreate: (data: FormData) =>
    http.post<Category>('/categories/admin/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  adminUpdate: (id: number, data: FormData) =>
    http.patch<Category>(`/categories/admin/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  adminDelete: (id: number) =>
    http.delete(`/categories/admin/${id}/`),

  adminBulk: (ids: number[], action: string) =>
    http.post('/categories/admin/bulk/', { ids, action }).then((r) => r.data),
}
