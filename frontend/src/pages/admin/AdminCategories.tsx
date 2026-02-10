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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useAppBackButton(useCallback(() => navigate('/admin'), [navigate]))

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
    try {
      await categoriesApi.adminDelete(id)
      loadData()
    } catch (e) { console.error(e) }
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
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)))
    }
  }

  const handleBulk = async (action: string) => {
    if (action === 'delete' && !confirm(`Удалить ${selectedIds.size} категорий? Все товары в них тоже будут удалены!`)) return
    try {
      await categoriesApi.adminBulk(Array.from(selectedIds), action)
      setSelectedIds(new Set())
      loadData()
    } catch (e) { console.error(e) }
  }

  const allSelected = categories.length > 0 && selectedIds.size === categories.length

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Категории</h2>
        <button
          onClick={(e) => { e.stopPropagation(); resetForm(); setShowForm(true) }}
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

      {/* Select all + bulk actions */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, flexWrap: 'wrap',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ width: 18, height: 18, accentColor: 'var(--green-main)' }}
            />
            {selectedIds.size > 0 ? `Выбрано: ${selectedIds.size}` : 'Выбрать все'}
          </label>

          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button
                onClick={() => handleBulk('activate')}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: '#E8F5E9', color: '#4CAF50',
                }}
              >
                Включить
              </button>
              <button
                onClick={() => handleBulk('deactivate')}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: '#FFF3E0', color: '#FF9800',
                }}
              >
                Выключить
              </button>
              <button
                onClick={() => handleBulk('delete')}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: '#FFF3F0', color: 'var(--red)',
                }}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          Нет категорий. Добавьте первую!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: selectedIds.has(cat.id) ? 'var(--green-bg)' : 'var(--white)',
                borderRadius: 12,
                padding: 12, boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
                border: selectedIds.has(cat.id) ? '1px solid var(--green-main)' : '1px solid transparent',
                opacity: cat.is_active ? 1 : 0.6,
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(cat.id)}
                onChange={() => toggleSelect(cat.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--green-main)', flexShrink: 0 }}
              />

              <div
                onClick={() => navigate(`/admin/categories/${cat.id}/products`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  flex: 1, cursor: 'pointer', minWidth: 0,
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
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {cat.name}
                    {!cat.is_active && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: '#FF9800', background: '#FFF3E0',
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        Скрыта
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Нажмите, чтобы управлять товарами</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setName(cat.name); setEditId(cat.id); setShowForm(true) }}
                  style={{ background: 'var(--green-bg)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--green-main)' }}
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(cat.id) }}
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
