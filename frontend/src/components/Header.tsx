import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export default function Header() {
  const navigate = useNavigate()
  const totalItems = useCartStore((s) => s.totalItems)

  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          🍎
        </div>
        <span style={{
          color: 'var(--white)',
          fontSize: 20,
          fontWeight: 700,
        }}>
          Грядка
        </span>
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Chat icon */}
        <button
          onClick={() => navigate('/chat')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* Cart icon */}
        <button
          onClick={() => navigate('/cart')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {totalItems() > 0 && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: 'var(--red)',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {totalItems()}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
