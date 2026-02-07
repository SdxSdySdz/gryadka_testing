import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { analyticsApi } from '../../api/analytics'
import { ordersApi } from '../../api/orders'
import type { Analytics, Order } from '../../types'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [todayStats, setTodayStats] = useState<Analytics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => {
    analyticsApi.get({ period: 'today' }).then(setTodayStats).catch(console.error)
    ordersApi.adminList({ status: 'new' }).then((orders) => setRecentOrders(orders.slice(0, 5))).catch(console.error)
  }, [])

  const cards = [
    { label: 'Заказы сегодня', value: todayStats?.total_orders ?? '—', color: 'var(--green-main)' },
    { label: 'Выручка сегодня', value: todayStats ? `${parseFloat(todayStats.total_revenue).toFixed(0)} ₽` : '—', color: 'var(--orange-main)' },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Админ-панель</h2>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: 'var(--white)', borderRadius: 14,
              padding: 16, boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* New orders */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Новые заказы</h3>
      {recentOrders.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: 20, textAlign: 'center' }}>Нет новых заказов</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate('/admin/orders')}
              style={{
                background: 'var(--white)', borderRadius: 12,
                padding: '12px 14px', boxShadow: 'var(--shadow)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Заказ #{order.id}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.user_display_name}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--green-main)' }}>
                {parseFloat(order.total).toFixed(0)} ₽
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
