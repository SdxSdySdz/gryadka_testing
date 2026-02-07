import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Главная', icon: 'home' },
  { path: '/favorites', label: 'Избранное', icon: 'heart' },
  { path: '/orders', label: 'Заказы', icon: 'orders' },
  { path: '/profile', label: 'Профиль', icon: 'profile' },
]

const icons: Record<string, (active: boolean) => JSX.Element> = {
  home: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2E7D32' : '#757575'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  heart: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#2E7D32' : 'none'} stroke={active ? '#2E7D32' : '#757575'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  orders: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2E7D32' : '#757575'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  profile: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2E7D32' : '#757575'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--bottom-nav-height)',
      background: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      zIndex: 100,
    }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              padding: '8px 16px',
            }}
          >
            {icons[tab.icon](active)}
            <span style={{
              fontSize: 11,
              fontWeight: active ? 700 : 400,
              color: active ? 'var(--green-main)' : 'var(--text-secondary)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
