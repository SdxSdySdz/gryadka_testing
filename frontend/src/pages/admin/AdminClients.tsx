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

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastText, setBroadcastText] = useState('')
  const [sending, setSending] = useState(false)

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)))
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return
    setSending(true)
    try {
      const result = await usersApi.broadcast(Array.from(selectedIds), broadcastText.trim())
      alert(`Отправлено: ${result.sent}, ошибок: ${result.failed}`)
      setShowBroadcast(false)
      setBroadcastText('')
      setSelectedIds(new Set())
    } catch (e) {
      console.error(e)
      alert('Ошибка при рассылке')
    } finally {
      setSending(false)
    }
  }

  const allSelected = clients.length > 0 && selectedIds.size === clients.length

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Клиенты</h2>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Поиск по имени, телефону, username..."
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box',
          marginBottom: 12,
        }}
      />

      {/* Select all + actions bar */}
      {clients.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12, padding: '8px 0',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ width: 18, height: 18, accentColor: 'var(--green-main)' }}
            />
            {selectedIds.size > 0 ? `Выбрано: ${selectedIds.size}` : 'Выбрать всех'}
          </label>

          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBroadcast(true)}
              style={{
                padding: '8px 16px', borderRadius: 10,
                background: 'var(--green-main)', color: 'white',
                fontSize: 13, fontWeight: 600,
              }}
            >
              Написать сообщение
            </button>
          )}
        </div>
      )}

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
              onClick={() => toggleSelect(client.id)}
              style={{
                background: selectedIds.has(client.id) ? 'var(--green-bg)' : 'var(--white)',
                borderRadius: 12,
                padding: '12px 14px', boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
                border: selectedIds.has(client.id) ? '1px solid var(--green-main)' : '1px solid transparent',
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(client.id)}
                onChange={() => toggleSelect(client.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 18, height: 18, accentColor: 'var(--green-main)', flexShrink: 0 }}
              />

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
                  {client.phone && ` \u00B7 ${client.phone}`}
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

      {/* Broadcast modal */}
      {showBroadcast && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 16,
        }}
          onClick={() => setShowBroadcast(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--white)', borderRadius: 16,
              padding: 20, width: '100%', maxWidth: 400,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
              Рассылка ({selectedIds.size} получателей)
            </h3>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Введите сообщение..."
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: '1px solid #e0e0e0', fontSize: 14,
                minHeight: 120, resize: 'vertical', boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={handleBroadcast}
                disabled={sending || !broadcastText.trim()}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  background: (sending || !broadcastText.trim()) ? '#ccc' : 'var(--green-main)',
                  color: 'white', fontSize: 14, fontWeight: 600,
                }}
              >
                {sending ? 'Отправляем...' : 'Отправить'}
              </button>
              <button
                onClick={() => setShowBroadcast(false)}
                style={{
                  padding: '12px 20px', borderRadius: 10,
                  background: 'var(--bg)', fontSize: 14,
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
