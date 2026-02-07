import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { ordersApi } from '../api/orders'
import { settingsApi } from '../api/settings'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { ShopSettings, PriceType } from '../types'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [district, setDistrict] = useState('')
  const [interval, setInterval] = useState('')
  const [comment, setComment] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  useEffect(() => {
    settingsApi.getPublic().then((s) => {
      setSettings(s)
      if (s.delivery_methods.length > 0) setDeliveryMethod(s.delivery_methods[0].name)
      if (s.payment_methods.length > 0) setPaymentMethod(s.payment_methods[0].name)
    }).catch(console.error)
  }, [])

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const total = totalPrice()
  const minSum = settings ? parseFloat(settings.min_order_sum) : 0
  const isCourier = deliveryMethod.toLowerCase().includes('курьер')
  const isFreeDelivery = minSum > 0 && total >= minSum

  const handleSubmit = async () => {
    if (minSum > 0 && total < minSum) {
      setError(`Минимальная сумма заказа: ${minSum.toFixed(0)} ₽`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await ordersApi.create({
        delivery_method: deliveryMethod,
        delivery_district: isCourier ? district : '',
        delivery_interval: isCourier ? interval : '',
        payment_method: paymentMethod,
        comment,
        promo_code: promoCode,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price_type: i.priceType,
        })),
      })
      clearCart()
      navigate('/orders')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка при оформлении заказа')
    } finally {
      setSubmitting(false)
    }
  }

  const selectStyle = {
    width: '100%', padding: '12px', borderRadius: 10,
    border: '1px solid #e0e0e0', fontSize: 14,
    background: 'var(--white)', appearance: 'none' as const,
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Оформление заказа</h2>

      {/* Delivery method */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          Способ доставки
        </label>
        <select
          value={deliveryMethod}
          onChange={(e) => setDeliveryMethod(e.target.value)}
          style={selectStyle}
        >
          {settings?.delivery_methods.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Courier options */}
      {isCourier && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Район доставки
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={selectStyle}
            >
              <option value="">Выберите район</option>
              {settings?.delivery_districts.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              Интервал доставки
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              style={selectStyle}
            >
              <option value="">Выберите интервал</option>
              {settings?.delivery_intervals.map((i) => (
                <option key={i.id} value={i.label}>{i.label}</option>
              ))}
            </select>
          </div>

          {isFreeDelivery && (
            <div style={{
              background: 'var(--green-bg)', borderRadius: 10,
              padding: '10px 14px', marginBottom: 16,
              color: 'var(--green-main)', fontSize: 13, fontWeight: 500,
            }}>
              Доставка бесплатная! (сумма заказа от {minSum.toFixed(0)} ₽)
            </div>
          )}
        </>
      )}

      {/* Payment method */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          Способ оплаты
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={selectStyle}
        >
          {settings?.payment_methods.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий к заказу..."
          style={{
            ...selectStyle,
            minHeight: 80,
            resize: 'vertical',
          }}
        />
      </div>

      {/* Promo code (mock) */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          Промокод
        </label>
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Введите промокод"
          style={selectStyle}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#FFF3F0', color: 'var(--red)',
          padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Total + Submit */}
      <div style={{
        background: 'var(--white)', borderRadius: 16,
        padding: 16, boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Итого:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-main)' }}>
            {total.toFixed(0)} ₽
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: submitting ? '#ccc' : 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            color: 'white', fontSize: 16, fontWeight: 600,
          }}
        >
          {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
        </button>
      </div>
    </div>
  )
}
