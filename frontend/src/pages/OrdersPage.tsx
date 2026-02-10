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
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    ordersApi.list().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) => setExpandedId(expandedId === id ? null : id)

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
            {orders.map((order) => {
              const expanded = expandedId === order.id
              const deliveryPrice = parseFloat(order.delivery_price || '0')
              const urgency = parseFloat(order.urgency_surcharge || '0')
              const total = parseFloat(order.total)
              const itemsTotal = total - deliveryPrice - urgency

              return (
                <div
                  key={order.id}
                  onClick={() => toggle(order.id)}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 14,
                    padding: 16,
                    boxShadow: 'var(--shadow)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? 12 : 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>Заказ #{order.id}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      padding: '4px 10px', borderRadius: 6,
                      background: `${statusColors[order.status]}15`,
                      color: statusColors[order.status],
                    }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  {!expanded ? (
                    <>
                      {/* Collapsed: short summary */}
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                        {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                          {new Date(order.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-main)' }}>
                          {total.toFixed(0)} ₽
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Expanded: full details */}
                      {/* Items */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Товары</div>
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

                      {/* Delivery info */}
                      {order.delivery_method && (
                        <div style={{ marginBottom: 12, fontSize: 13 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Доставка</div>
                          <div>🚚 {order.delivery_method}</div>
                          {order.delivery_district && <div style={{ color: 'var(--text-secondary)' }}>Район: {order.delivery_district}</div>}
                          {order.delivery_interval && <div style={{ color: 'var(--text-secondary)' }}>Интервал: {order.delivery_interval}</div>}
                          {order.is_urgent && <div style={{ color: '#FF9800' }}>⚡ Срочная доставка</div>}
                        </div>
                      )}

                      {/* Address */}
                      {order.address && (
                        <div style={{ marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>📍 </span>{order.address}
                        </div>
                      )}

                      {/* Payment */}
                      {order.payment_method && (
                        <div style={{ marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>💳 </span>{order.payment_method}
                        </div>
                      )}

                      {/* Comment */}
                      {order.comment && (
                        <div style={{ marginBottom: 12, fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          💬 {order.comment}
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div style={{
                        borderTop: '1px solid #eee', paddingTop: 10,
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
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-hint)' }}>
                        {new Date(order.created_at).toLocaleString('ru-RU')}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
