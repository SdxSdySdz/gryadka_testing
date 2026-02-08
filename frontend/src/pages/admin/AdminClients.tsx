import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { usersApi } from '../../api/users'
import type { User } from '../../types'

export default function AdminClients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  // Load all clients on mount
  useEffect(() => {
    loadClients('')
  }, [])

  const loadClients = async (q: string) => {
    try {
      setLoading(true)
      const data = await usersApi.searchClients(q)
      setClients(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setInitialLoaded(true)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadClients(value)
    }, 300)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Клиенты</h2>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Поиск по имени, username или Telegram ID..."
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box',
          marginBottom: 16,
        }}
      />

      {/* Results */}
      {loading && !initialLoaded ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Загрузка...</div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          {search ? 'Клиенты не найдены' : 'Нет клиентов'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
              Поиск...
            </div>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              style={{
                background: 'var(--white)', borderRadius: 12,
                padding: '12px 14px', boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: client.is_admin
                  ? 'linear-gradient(135deg, var(--green-dark), var(--green-light))'
                  : '#e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: client.is_admin ? 'white' : '#666',
                fontWeight: 700, fontSize: 16, flexShrink: 0,
              }}>
                {client.first_name?.[0] || '?'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {client.display_name}
                  {client.is_admin && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: 'var(--green-main)', background: 'var(--green-bg)',
                      padding: '1px 6px', borderRadius: 4, marginLeft: 6,
                    }}>
                      Админ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  ID: {client.telegram_id}
                  {client.username && ` \u00B7 @${client.username}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                  {new Date(client.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
