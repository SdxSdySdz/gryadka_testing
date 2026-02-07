import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { usersApi } from '../../api/users'
import type { User } from '../../types'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [error, setError] = useState('')

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => { loadAdmins() }, [])

  const loadAdmins = async () => {
    try {
      const data = await usersApi.adminList()
      setAdmins(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!newId.trim()) return
    setError('')
    try {
      await usersApi.adminAdd(parseInt(newId))
      setNewId('')
      loadAdmins()
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка')
    }
  }

  const handleRemove = async (telegramId: number) => {
    if (!confirm('Убрать права администратора?')) return
    try {
      await usersApi.adminRemove(telegramId)
      loadAdmins()
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Управление админами</h2>

      {/* Add admin */}
      <div style={{
        background: 'var(--white)', borderRadius: 14,
        padding: 16, boxShadow: 'var(--shadow)', marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Добавить админа</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="Telegram ID пользователя"
            type="number"
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e0e0e0', fontSize: 14,
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: 'var(--green-main)', color: 'white',
              fontSize: 13, fontWeight: 600,
            }}
          >
            Добавить
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 8, color: 'var(--red)', fontSize: 13 }}>{error}</div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          Пользователь должен сначала открыть приложение, чтобы его можно было назначить админом.
        </div>
      </div>

      {/* Admin list */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Текущие админы</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {admins.map((admin) => (
            <div
              key={admin.id}
              style={{
                background: 'var(--white)', borderRadius: 12,
                padding: '12px 14px', boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {admin.first_name?.[0] || '?'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{admin.display_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  ID: {admin.telegram_id}
                  {admin.username && ` · @${admin.username}`}
                </div>
              </div>

              <button
                onClick={() => handleRemove(admin.telegram_id)}
                style={{
                  background: '#FFF3F0', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, color: 'var(--red)',
                  fontWeight: 500,
                }}
              >
                Убрать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
