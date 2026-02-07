import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAppBackButton } from '../hooks/useAppBackButton'
import { PRICE_TYPE_LABELS } from '../types'
import type { PriceType } from '../types'

function getItemPrice(item: { product: any; priceType: PriceType }): number {
  const map: Record<PriceType, string | null> = {
    kg: item.product.price_per_kg,
    box: item.product.price_per_box,
    pack: item.product.price_per_pack,
    unit: item.product.price_per_unit,
  }
  const val = map[item.priceType]
  return val ? parseFloat(val) : 0
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore()

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  if (items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Корзина пуста</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Добавьте товары из каталога
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 32px', borderRadius: 12,
            background: 'var(--green-main)', color: 'white',
            fontSize: 15, fontWeight: 600,
          }}
        >
          На главную
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Корзина</h2>
        <button
          onClick={clearCart}
          style={{ background: 'none', color: 'var(--red)', fontSize: 13 }}
        >
          Очистить
        </button>
      </div>

      {/* Cart items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {items.map((item) => {
          const price = getItemPrice(item)
          return (
            <div
              key={`${item.product.id}-${item.priceType}`}
              style={{
                background: 'var(--white)',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                gap: 12,
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Image */}
              <div style={{
                width: 70, height: 70, borderRadius: 10,
                background: '#f0f0f0', flexShrink: 0,
                overflow: 'hidden',
              }}>
                {item.product.main_image ? (
                  <img src={item.product.main_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🍎</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.product.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {price.toFixed(0)} ₽ {PRICE_TYPE_LABELS[item.priceType]}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'var(--bg)', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'var(--green-bg)', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--green-main)',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-main)' }}>
                    {(price * item.quantity).toFixed(0)} ₽
                  </span>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.product.id)}
                style={{ background: 'none', alignSelf: 'flex-start', padding: 4 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Total + checkout */}
      <div style={{
        background: 'var(--white)', borderRadius: 16,
        padding: 16, boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Итого:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-main)' }}>
            {totalPrice().toFixed(0)} ₽
          </span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            color: 'white', fontSize: 16, fontWeight: 600,
          }}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  )
}
