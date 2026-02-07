import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { ordersApi } from '../api/orders'
import { STATUS_LABELS } from '../types'
import type { Order } from '../types'

const statusColors: Record<string, string> = {
  new: '#2196F3',
  confirmed: '#FF9800',
  preparing: '#9C27B0',
  delivering: '#FF5722',
  completed: '#4CAF50',
  cancelled: '#F44336',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Header />
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Мои заказы</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Загрузка...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📦</div>
            <p style={{ color: 'var(--text-secondary)' }}>Заказов пока нет</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'var(--white)',
                  borderRadius: 14,
                  padding: 16,
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Заказ #{order.id}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 6,
                    background: `${statusColors[order.status]}15`,
                    color: statusColors[order.status],
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Items */}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {order.items.map((item) => (
                    <div key={item.id}>{item.product_name} x{item.quantity}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-main)' }}>
                    {parseFloat(order.total).toFixed(0)} ₽
                  </span>
                </div>

                {order.delivery_method && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {order.delivery_method}
                    {order.delivery_district && ` · ${order.delivery_district}`}
                    {order.delivery_interval && ` · ${order.delivery_interval}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
