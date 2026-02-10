import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import { ordersApi } from '../api/orders'
import { settingsApi } from '../api/settings'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { ShopSettings } from '../types'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const user = useUserStore((s) => s.user)
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [deliveryMethodId, setDeliveryMethodId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [district, setDistrict] = useState('')
  const [interval, setInterval] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [comment, setComment] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Address fields
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [entrance, setEntrance] = useState('')
  const [apartment, setApartment] = useState('')
  const [floor, setFloor] = useState('')
  const [intercom, setIntercom] = useState('')

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  // Auto-fill address from profile
  useEffect(() => {
    if (user) {
      if (user.street) setStreet(user.street)
      if (user.house) setHouse(user.house)
      if (user.entrance) setEntrance(user.entrance)
      if (user.apartment) setApartment(user.apartment)
      if (user.floor) setFloor(user.floor)
      if (user.intercom) setIntercom(user.intercom)
    }
  }, [user])

  useEffect(() => {
    settingsApi.getPublic().then((s) => {
      setSettings(s)
      if (s.delivery_methods.length > 0) setDeliveryMethodId(s.delivery_methods[0].id)
      if (s.payment_methods.length > 0) setPaymentMethod(s.payment_methods[0].name)
    }).catch(console.error)
  }, [])

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const itemsTotal = totalPrice()
  const minSum = settings ? parseFloat(settings.min_order_sum) : 0
  const freeThreshold = settings ? parseFloat(settings.free_delivery_threshold) : 5000
  const urgencySurcharge = settings ? parseFloat(settings.urgency_surcharge) : 0

  const selectedMethod = settings?.delivery_methods.find((m) => m.id === deliveryMethodId)
  const deliveryMethodName = selectedMethod?.name || ''
  const deliveryPrice = selectedMethod ? parseFloat(selectedMethod.price) : 0
  const isFreeDelivery = freeThreshold > 0 && itemsTotal >= freeThreshold
  const actualDeliveryPrice = isFreeDelivery ? 0 : deliveryPrice
  const actualUrgency = isUrgent ? urgencySurcharge : 0
  const grandTotal = itemsTotal + actualDeliveryPrice + actualUrgency

  const belowMinSum = minSum > 0 && itemsTotal < minSum

  // Build full address string
  const buildAddress = () => {
    const parts: string[] = []
    if (street) parts.push(`ул. ${street}`)
    if (house) parts.push(`д. ${house}`)
    if (entrance) parts.push(`подъезд ${entrance}`)
    if (floor) parts.push(`этаж ${floor}`)
    if (apartment) parts.push(`кв. ${apartment}`)
    if (intercom) parts.push(`домофон ${intercom}`)
    return parts.join(', ')
  }

  const handleSubmit = async () => {
    if (belowMinSum) return
    setSubmitting(true)
    setError('')
    try {
      await ordersApi.create({
        delivery_method: deliveryMethodName,
        delivery_district: district,
        delivery_interval: interval,
        is_urgent: isUrgent,
        payment_method: paymentMethod,
        address: buildAddress(),
        comment,
        promo_code: promoCode,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price_type: i.priceType,
          ...(i.priceType === 'gram' && i.selectedGrams ? { selected_grams: i.selectedGrams } : {}),
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

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '12px', borderRadius: 10,
    border: '1px solid #e0e0e0', fontSize: 14,
    background: 'var(--white)', appearance: 'none' as const,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Оформление заказа</h2>

      {/* Address */}
      <div style={{
        background: 'var(--white)', borderRadius: 14, padding: 14,
        boxShadow: 'var(--shadow)', marginBottom: 16,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Адрес доставки</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <input style={selectStyle} value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Улица" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={selectStyle} value={house} onChange={(e) => setHouse(e.target.value)} placeholder="Дом" />
            <input style={selectStyle} value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="Подъезд" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input style={selectStyle} value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="Кв." />
            <input style={selectStyle} value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Этаж" />
            <input style={selectStyle} value={intercom} onChange={(e) => setIntercom(e.target.value)} placeholder="Домофон" />
          </div>
        </div>
      </div>

      {/* Delivery method — radio-style buttons */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          Способ доставки
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {settings?.delivery_methods.map((m) => {
            const mPrice = parseFloat(m.price)
            const mFree = isFreeDelivery
            const isSelected = deliveryMethodId === m.id
            return (
              <button
                key={m.id}
                onClick={() => setDeliveryMethodId(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10,
                  background: isSelected ? 'var(--green-bg)' : 'var(--white)',
                  border: isSelected ? '2px solid var(--green-main)' : '1px solid #e0e0e0',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: isSelected ? '6px solid var(--green-main)' : '2px solid #ccc',
                    background: 'var(--white)',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>{m.name}</span>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: mFree ? 'var(--green-main)' : 'var(--text-secondary)',
                }}>
                  {mFree ? 'Бесплатно' : mPrice > 0 ? `${mPrice.toFixed(0)} ₽` : 'Бесплатно'}
                </span>
              </button>
            )
          })}
        </div>
        {freeThreshold > 0 && (
          <div style={{
            background: isFreeDelivery ? 'var(--green-bg)' : '#f5f5f5',
            borderRadius: 10,
            padding: '8px 14px', marginTop: 8,
            color: isFreeDelivery ? 'var(--green-main)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 500,
          }}>
            {isFreeDelivery
              ? `🎉 Доставка бесплатная при заказе от ${freeThreshold.toFixed(0)} ₽`
              : `Бесплатная доставка при заказе от ${freeThreshold.toFixed(0)} ₽ (осталось ${(freeThreshold - itemsTotal).toFixed(0)} ₽)`
            }
          </div>
        )}
      </div>

      {/* District */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
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

      {/* Interval */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
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

      {/* Urgency toggle */}
      {urgencySurcharge > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setIsUrgent(!isUrgent)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '12px 14px', borderRadius: 10,
              background: isUrgent ? 'var(--green-bg)' : 'var(--white)',
              border: isUrgent ? '2px solid var(--green-main)' : '1px solid #e0e0e0',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Срочная доставка</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Доставим в ближайшее время</div>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: isUrgent ? 'var(--green-main)' : 'var(--text-secondary)' }}>
              +{urgencySurcharge.toFixed(0)} ₽
            </span>
          </button>
        </div>
      )}

      {/* Payment method */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
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
        <label style={labelStyle}>
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

      {/* Promo code */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
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
        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Товары:</span>
            <span>{itemsTotal.toFixed(0)} ₽</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Доставка ({deliveryMethodName}):</span>
            <span style={{ color: isFreeDelivery ? 'var(--green-main)' : undefined }}>
              {isFreeDelivery ? 'Бесплатно' : `${actualDeliveryPrice.toFixed(0)} ₽`}
            </span>
          </div>
          {isUrgent && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>⚡ Срочность:</span>
              <span>{actualUrgency.toFixed(0)} ₽</span>
            </div>
          )}
        </div>

        <div style={{
          borderTop: '1px solid #eee', paddingTop: 12,
          display: 'flex', justifyContent: 'space-between', marginBottom: 16,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Итого:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-main)' }}>
            {grandTotal.toFixed(0)} ₽
          </span>
        </div>
        {belowMinSum && (
          <div style={{
            background: '#FFF3F0', borderRadius: 10,
            padding: '8px 14px', marginBottom: 12,
            color: 'var(--red)', fontSize: 13, fontWeight: 500,
          }}>
            Минимальная сумма заказа: {minSum.toFixed(0)} ₽ (не хватает {(minSum - itemsTotal).toFixed(0)} ₽)
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || belowMinSum}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: (submitting || belowMinSum) ? '#ccc' : 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            color: 'white', fontSize: 16, fontWeight: 600,
          }}
        >
          {submitting ? 'Оформляем...' : belowMinSum ? `Минимум ${minSum.toFixed(0)} ₽` : 'Подтвердить заказ'}
        </button>
      </div>
    </div>
  )
}
