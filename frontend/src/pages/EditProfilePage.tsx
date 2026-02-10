import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../hooks/useAppBackButton'
import { useUserStore } from '../store/userStore'
import { usersApi } from '../api/users'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, fetchUser } = useUserStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    phone: '',
    street: '',
    house: '',
    entrance: '',
    apartment: '',
    floor: '',
    intercom: '',
  })

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        phone: user.phone || '',
        street: user.street || '',
        house: user.house || '',
        entrance: user.entrance || '',
        apartment: user.apartment || '',
        floor: user.floor || '',
        intercom: user.intercom || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await usersApi.updateMe(form)
      await fetchUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
    marginBottom: 4, display: 'block',
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Мои данные</h2>

      <div style={{
        background: 'var(--white)', borderRadius: 16,
        padding: 16, boxShadow: 'var(--shadow)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div>
          <label style={labelStyle}>Имя</label>
          <input style={inputStyle} value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="Ваше имя" />
        </div>

        <div>
          <label style={labelStyle}>Номер телефона</label>
          <input style={inputStyle} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+7 (___) ___-__-__" type="tel" />
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Адрес доставки</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Улица</label>
              <input style={inputStyle} value={form.street} onChange={(e) => update('street', e.target.value)} placeholder="Улица" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Дом</label>
                <input style={inputStyle} value={form.house} onChange={(e) => update('house', e.target.value)} placeholder="Дом" />
              </div>
              <div>
                <label style={labelStyle}>Подъезд</label>
                <input style={inputStyle} value={form.entrance} onChange={(e) => update('entrance', e.target.value)} placeholder="Подъезд" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Квартира</label>
                <input style={inputStyle} value={form.apartment} onChange={(e) => update('apartment', e.target.value)} placeholder="Квартира" />
              </div>
              <div>
                <label style={labelStyle}>Этаж</label>
                <input style={inputStyle} value={form.floor} onChange={(e) => update('floor', e.target.value)} placeholder="Этаж" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Код домофона</label>
              <input style={inputStyle} value={form.intercom} onChange={(e) => update('intercom', e.target.value)} placeholder="Код домофона" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: saved ? '#4CAF50' : saving ? '#ccc' : 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
            color: 'white', fontSize: 15, fontWeight: 600,
            marginTop: 4,
          }}
        >
          {saving ? 'Сохраняем...' : saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
