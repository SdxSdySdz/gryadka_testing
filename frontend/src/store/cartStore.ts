import { create } from 'zustand'
import type { CartItem, Product, PriceType } from '../types'

function getPrice(product: Product, priceType: PriceType): number {
  const map: Record<PriceType, string | null> = {
    kg: product.price_per_kg,
    box: product.price_per_box,
    pack: product.price_per_pack,
    unit: product.price_per_unit,
  }
  const val = map[priceType]
  return val ? parseFloat(val) : 0
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, priceType: PriceType) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, priceType) => {
    const items = get().items
    const existing = items.find((i) => i.product.id === product.id && i.priceType === priceType)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id && i.priceType === priceType
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1, priceType }] })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + getPrice(i.product, i.priceType) * i.quantity, 0),
}))
