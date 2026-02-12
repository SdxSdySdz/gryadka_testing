import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { ordersApi } from '../../api/orders'
import { STATUS_LABELS } from '../../types'
import type { Order } from '../../types'

const STATUS_OPTIONS = ['new', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled']
const statusColors: Record<string, string> = {
  new: '#2196F3', confirmed: '#FF9800', preparing: '#9C27B0',
  delivering: '#FF5722', completed: '#4CAF50', cancelled: '#F44336',
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => { loadOrders() }, [filter])

  // Clear selection when filter changes
  useEffect(() => { setSelectedIds(new Set()) }, [filter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await ordersApi.adminList(filter ? { status: filter } : undefined)
      setOrders(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.adminUpdateStatus(orderId, newStatus)
      loadOrders()
    } catch (e) { console.error(e) }
  }

  const toggle = (id: number) => setExpandedId(expandedId === id ? null : id)

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = orders.length > 0 && selectedIds.size === orders.length
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.size === 0) return
    try {
      await ordersApi.adminBulkStatus(Array.from(selectedIds), newStatus)
      setSelectedIds(new Set())
      loadOrders()
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Заказы</h2>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        <button
          onClick={() => setFilter('')}
          style={{
            padding: '6px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: filter === '' ? 600 : 400,
            background: filter === '' ? 'var(--green-main)' : 'var(--white)',
            color: filter === '' ? 'white' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          Все
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 8,
              fontSize: 12, fontWeight: filter === s ? 600 : 400,
              background: filter === s ? statusColors[s] : 'var(--white)',
              color: filter === s ? 'white' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Select all + bulk actions */}
      {orders.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, flexWrap: 'wrap',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ width: 18, height: 18, accentColor: 'var(--green-main)' }}
            />
            {selectedIds.size > 0 ? `Выбрано: ${selectedIds.size}` : 'Выбрать все'}
          </label>

          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleBulkStatus(s)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: `${statusColors[s]}15`,
                    color: statusColors[s],
                    border: `1px solid ${statusColors[s]}40`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Нет заказов</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((order) => {
            const expanded = expandedId === order.id
            const selected = selectedIds.has(order.id)
            const deliveryPrice = parseFloat(order.delivery_price || '0')
            const urgency = parseFloat(order.urgency_surcharge || '0')
            const total = parseFloat(order.total)
            const itemsTotal = total - deliveryPrice - urgency

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--white)', borderRadius: 14,
                  padding: 14, boxShadow: 'var(--shadow)',
                  border: selected ? '2px solid var(--green-main)' : '2px solid transparent',
                }}
              >
                {/* Header — clickable */}
                <div
                  style={{ cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(order.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 18, height: 18, accentColor: 'var(--green-main)', marginTop: 2, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }} onClick={() => toggle(order.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>#{order.id}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.user_display_name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 6px',
                          borderRadius: 6,
                          background: `${statusColors[order.status]}15`,
                          color: statusColors[order.status],
                        }}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2"
                          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--green-main)' }}>
                        {total.toFixed(0)} ₽
                      </span>
                    </div>

                    {!expanded && (
                      <>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {order.items.map((item) => item.product_name).join(', ')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                            {new Date(order.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {expanded && (
                  <>
                    {/* Items */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Товары</div>
                      {order.items.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 13, padding: '4px 0',
                          borderBottom: '1px solid #f5f5f5',
                        }}>
                          <span>{item.product_name} x{item.quantity}</span>
                          <span style={{ fontWeight: 600 }}>{parseFloat(item.subtotal).toFixed(0)} ₽</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery */}
                    {order.delivery_method && (
                      <div style={{ marginBottom: 10, fontSize: 13 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)', fontSize: 12 }}>Доставка</div>
                        <div>🚚 {order.delivery_method}</div>
                        {order.delivery_district && <div style={{ color: 'var(--text-secondary)' }}>Район: {order.delivery_district}</div>}
                        {order.delivery_interval && <div style={{ color: 'var(--text-secondary)' }}>Интервал: {order.delivery_interval}</div>}
                        {order.is_urgent && <div style={{ color: '#FF9800' }}>⚡ Срочная доставка</div>}
                      </div>
                    )}

                    {/* Address */}
                    {order.address && (
                      <div style={{ marginBottom: 10, fontSize: 13 }}>
                        📍 {order.address}
                      </div>
                    )}

                    {/* Payment */}
                    {order.payment_method && (
                      <div style={{ marginBottom: 10, fontSize: 13 }}>
                        💳 {order.payment_method}
                      </div>
                    )}

                    {/* Comment */}
                    {order.comment && (
                      <div style={{ marginBottom: 10, fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        💬 {order.comment}
                      </div>
                    )}

                    {/* Price breakdown */}
                    <div style={{
                      borderTop: '1px solid #eee', paddingTop: 8, marginBottom: 10,
                      display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Товары:</span>
                        <span>{itemsTotal.toFixed(0)} ₽</span>
                      </div>
                      {deliveryPrice > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Доставка:</span>
                          <span>{deliveryPrice.toFixed(0)} ₽</span>
                        </div>
                      )}
                      {deliveryPrice === 0 && order.delivery_method && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Доставка:</span>
                          <span style={{ color: 'var(--green-main)' }}>Бесплатно</span>
                        </div>
                      )}
                      {urgency > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>⚡ Срочность:</span>
                          <span>{urgency.toFixed(0)} ₽</span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontWeight: 700, fontSize: 15, paddingTop: 6,
                        borderTop: '1px solid #eee',
                      }}>
                        <span>Итого:</span>
                        <span style={{ color: 'var(--green-main)' }}>{total.toFixed(0)} ₽</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 11, color: 'var(--text-hint)', marginBottom: 10 }}>
                      {new Date(order.created_at).toLocaleString('ru-RU')}
                    </div>

                    {/* Status change */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: 8,
                          border: `1px solid ${statusColors[order.status]}`,
                          fontSize: 13, fontWeight: 600,
                          color: statusColors[order.status],
                          background: `${statusColors[order.status]}10`,
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
