import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { categoriesApi } from '../../api/products'
import type { Category } from '../../types'

export default function AdminCategories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data = await categoriesApi.adminList()
      setCategories(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setName('')
    setImage(null)
    setEditId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    const fd = new FormData()
    fd.append('name', name)
    if (image) fd.append('image', image)

    try {
      if (editId) {
        await categoriesApi.adminUpdate(editId, fd)
      } else {
        await categoriesApi.adminCreate(fd)
      }
      resetForm()
      loadData()
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.error || e?.response?.data?.detail || e?.message || 'Ошибка'
      alert(`Ошибка: ${msg}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить категорию? Все товары в ней тоже будут удалены!')) return
    await categoriesApi.adminDelete(id)
    loadData()
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14,
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Категории</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'var(--green-main)', color: 'white',
            fontSize: 13, fontWeight: 600,
          }}
        >
          + Добавить
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--white)', borderRadius: 14,
          padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={inputStyle} placeholder="Название категории" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--green-main)', color: 'white', fontSize: 14, fontWeight: 600 }}>
                {editId ? 'Сохранить' : 'Создать'}
              </button>
              <button onClick={resetForm} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--bg)', fontSize: 14 }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: 'var(--white)', borderRadius: 12,
                padding: 12, boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#f0f0f0', flexShrink: 0, overflow: 'hidden',
              }}>
                {cat.image ? (
                  <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📁</div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.name}</div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { setName(cat.name); setEditId(cat.id); setShowForm(true) }}
                  style={{ background: 'var(--green-bg)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--green-main)' }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{ background: '#FFF3F0', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--red)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
