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

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => { loadOrders() }, [filter])

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Нет заказов</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--white)', borderRadius: 14,
                padding: 14, boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>#{order.id}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>{order.user_display_name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--green-main)' }}>
                  {parseFloat(order.total).toFixed(0)} ₽
                </span>
              </div>

              {/* Items */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {order.items.map((item) => (
                  <div key={item.id}>{item.product_name} x{item.quantity}</div>
                ))}
              </div>

              {order.delivery_method && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  📦 {order.delivery_method}
                  {order.delivery_district && ` · ${order.delivery_district}`}
                  {order.delivery_interval && ` · ${order.delivery_interval}`}
                </div>
              )}

              {order.comment && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  💬 {order.comment}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                  {new Date(order.created_at).toLocaleString('ru-RU')}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    border: `1px solid ${statusColors[order.status]}`,
                    fontSize: 12, fontWeight: 600,
                    color: statusColors[order.status],
                    background: `${statusColors[order.status]}10`,
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
