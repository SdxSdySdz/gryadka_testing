export interface User {
  id: number
  telegram_id: number
  first_name: string
  last_name: string
  username: string
  photo_url: string
  is_admin: boolean
  display_name: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  image: string | null
  sort_order: number
  is_active: boolean
}

export interface ProductImage {
  id: number
  image: string
  sort_order: number
}

export interface Product {
  id: number
  name: string
  category: number
  category_name: string
  description?: string
  price_per_kg: string | null
  price_per_box: string | null
  price_per_pack: string | null
  price_per_unit: string | null
  price_per_100g: string | null
  available_grams: string
  box_weight: number | null
  pack_weight: number | null
  old_price: string | null
  tag: '' | 'hit' | 'sale' | 'recommended'
  in_stock: boolean
  main_image?: string | null
  images?: ProductImage[]
  created_at?: string
}

export type PriceType = 'kg' | 'gram' | 'pack' | 'box' | 'unit'

export interface CartItem {
  product: Product
  quantity: number
  priceType: PriceType
  selectedGrams?: number
}

export interface OrderItem {
  id: number
  product: number | null
  product_name: string
  quantity: string
  price_type: string
  price: string
  subtotal: string
}

export interface Order {
  id: number
  user: number
  user_display_name: string
  status: string
  delivery_method: string
  delivery_district: string
  delivery_interval: string
  payment_method: string
  comment: string
  promo_code: string
  total: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  room: number
  sender: number
  sender_name: string
  sender_is_admin: boolean
  text: string
  is_read: boolean
  created_at: string
}

export interface ChatRoom {
  id: number
  client: number
  client_name: string
  client_username: string
  last_message: ChatMessage | null
  unread_count: number
  updated_at: string
}

export interface ShopSettings {
  min_order_sum: string
  payment_methods: { id: number; name: string; is_active: boolean; sort_order: number }[]
  delivery_methods: { id: number; name: string; is_active: boolean; sort_order: number }[]
  delivery_districts: { id: number; name: string }[]
  delivery_intervals: { id: number; label: string; sort_order: number }[]
}

export interface Analytics {
  total_orders: number
  total_revenue: string
  start_date: string
  end_date: string
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  preparing: 'Собирается',
  delivering: 'Доставляется',
  completed: 'Завершен',
  cancelled: 'Отменен',
}

export const TAG_LABELS: Record<string, string> = {
  hit: 'Хит',
  sale: 'Акция',
  recommended: 'Советую',
}

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  kg: 'за кг',
  gram: 'за 100г',
  pack: 'за упаковку',
  box: 'за ящик',
  unit: 'за штуку',
}

/**
 * Format weight in grams to human-readable string.
 * < 1000g => display in grams, >= 1000g => display in kilograms.
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000
    return `${kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(1)} кг`
  }
  return `${grams} г`
}
