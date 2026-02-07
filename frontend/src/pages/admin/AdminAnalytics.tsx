import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { analyticsApi } from '../../api/analytics'
import type { Analytics } from '../../types'

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('today')
  const [customDate, setCustomDate] = useState('')
  const [stats, setStats] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => {
    loadStats()
  }, [period, customDate])

  const loadStats = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (period === 'custom' && customDate) {
        params.date = customDate
      } else {
        params.period = period
      }
      const data = await analyticsApi.get(params)
      setStats(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const periods = [
    { value: 'today', label: 'Сегодня' },
    { value: 'yesterday', label: 'Вчера' },
    { value: 'month', label: 'Месяц' },
    { value: 'custom', label: 'По дате' },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Аналитика</h2>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: '8px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: period === p.value ? 600 : 400,
              background: period === p.value ? 'var(--green-main)' : 'var(--white)',
              color: period === p.value ? 'white' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date */}
      {period === 'custom' && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e0e0e0', fontSize: 14,
            }}
          />
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            background: 'var(--white)', borderRadius: 14,
            padding: 20, boxShadow: 'var(--shadow)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Заказов</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-main)' }}>
              {stats.total_orders}
            </div>
          </div>

          <div style={{
            background: 'var(--white)', borderRadius: 14,
            padding: 20, boxShadow: 'var(--shadow)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Выручка</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--orange-main)' }}>
              {parseFloat(stats.total_revenue).toFixed(0)} ₽
            </div>
          </div>

          <div style={{
            gridColumn: '1 / -1',
            background: 'var(--white)', borderRadius: 14,
            padding: 16, boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Период: {stats.start_date}
              {stats.start_date !== stats.end_date && ` — ${stats.end_date}`}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
