import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useUserStore } from '../store/userStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, loading } = useUserStore()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>
  }

  const adminMenuItems = [
    { label: 'Сводка', path: '/admin', icon: '📊' },
    { label: 'Товары', path: '/admin/products', icon: '📦' },
    { label: 'Категории', path: '/admin/categories', icon: '📁' },
    { label: 'Заказы', path: '/admin/orders', icon: '🛍️' },
    { label: 'Мессенджер', path: '/admin/chat', icon: '💬' },
    { label: 'Аналитика', path: '/admin/analytics', icon: '📈' },
    { label: 'Настройки', path: '/admin/settings', icon: '⚙️' },
    { label: 'Админы', path: '/admin/users', icon: '👥' },
  ]

  return (
    <div>
      <Header />
      <div style={{ padding: 16 }}>
        {/* User card */}
        <div style={{
          background: 'var(--white)', borderRadius: 16,
          padding: 20, boxShadow: 'var(--shadow)',
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 22, fontWeight: 700,
          }}>
            {user?.first_name?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{user?.display_name || 'Пользователь'}</div>
            {user?.username && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>@{user.username}</div>
            )}
            {user?.is_admin && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--green-main)', background: 'var(--green-bg)',
                padding: '2px 8px', borderRadius: 4, marginTop: 4, display: 'inline-block',
              }}>
                Администратор
              </span>
            )}
          </div>
        </div>

        {/* Admin panel */}
        {user?.is_admin && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Админ-панель</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {adminMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: 'var(--shadow)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                  <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
