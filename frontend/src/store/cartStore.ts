import { create } from 'zustand'
import type { CartItem, Product, PriceType } from '../types'

function getPrice(product: Product, priceType: PriceType, selectedGrams?: number): number {
  if (priceType === 'gram' && product.price_per_100g) {
    const per100 = parseFloat(product.price_per_100g)
    return selectedGrams ? per100 * selectedGrams / 100 : per100
  }
  const map: Record<string, string | null> = {
    kg: product.price_per_kg,
    box: product.price_per_box,
    pack: product.price_per_pack,
    unit: product.price_per_unit,
  }
  const val = map[priceType]
  return val ? parseFloat(val) : 0
}

/** Generate a unique key for a cart item — products with different grammages are separate items */
function cartItemKey(productId: number, priceType: PriceType, selectedGrams?: number): string {
  if (priceType === 'gram' && selectedGrams) {
    return `${productId}-${priceType}-${selectedGrams}`
  }
  return `${productId}-${priceType}`
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, priceType: PriceType, selectedGrams?: number) => void
  removeItem: (productId: number, priceType?: PriceType, selectedGrams?: number) => void
  updateQuantity: (productId: number, quantity: number, priceType?: PriceType, selectedGrams?: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, priceType, selectedGrams) => {
    const items = get().items
    const key = cartItemKey(product.id, priceType, selectedGrams)
    const existing = items.find(
      (i) => cartItemKey(i.product.id, i.priceType, i.selectedGrams) === key
    )
    if (existing) {
      set({
        items: items.map((i) =>
          cartItemKey(i.product.id, i.priceType, i.selectedGrams) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1, priceType, selectedGrams }] })
    }
  },

  removeItem: (productId, priceType, selectedGrams) => {
    if (priceType) {
      const key = cartItemKey(productId, priceType, selectedGrams)
      set({ items: get().items.filter((i) => cartItemKey(i.product.id, i.priceType, i.selectedGrams) !== key) })
    } else {
      set({ items: get().items.filter((i) => i.product.id !== productId) })
    }
  },

  updateQuantity: (productId, quantity, priceType, selectedGrams) => {
    if (quantity <= 0) {
      get().removeItem(productId, priceType, selectedGrams)
      return
    }
    if (priceType) {
      const key = cartItemKey(productId, priceType, selectedGrams)
      set({
        items: get().items.map((i) =>
          cartItemKey(i.product.id, i.priceType, i.selectedGrams) === key
            ? { ...i, quantity }
            : i
        ),
      })
    } else {
      set({
        items: get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      })
    }
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + getPrice(i.product, i.priceType, i.selectedGrams) * i.quantity, 0),
}))
