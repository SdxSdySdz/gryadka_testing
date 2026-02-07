import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { productsApi, categoriesApi } from '../../api/products'
import type { Product, Category } from '../../types'
import { TAG_LABELS } from '../../types'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', category: '', description: '',
    price_per_kg: '', price_per_unit: '', price_per_pack: '', price_per_box: '',
    old_price: '', tag: '', in_stock: true,
  })
  const [images, setImages] = useState<File[]>([])

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([productsApi.adminList(), categoriesApi.adminList()])
      setProducts(prods)
      setCategories(cats)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({ name: '', category: '', description: '', price_per_kg: '', price_per_unit: '', price_per_pack: '', price_per_box: '', old_price: '', tag: '', in_stock: true })
    setImages([])
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      category: String(p.category),
      description: p.description || '',
      price_per_kg: p.price_per_kg || '',
      price_per_unit: p.price_per_unit || '',
      price_per_pack: p.price_per_pack || '',
      price_per_box: p.price_per_box || '',
      old_price: p.old_price || '',
      tag: p.tag,
      in_stock: p.in_stock,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('category', form.category)
    fd.append('description', form.description)
    if (form.price_per_kg) fd.append('price_per_kg', form.price_per_kg)
    if (form.price_per_unit) fd.append('price_per_unit', form.price_per_unit)
    if (form.price_per_pack) fd.append('price_per_pack', form.price_per_pack)
    if (form.price_per_box) fd.append('price_per_box', form.price_per_box)
    if (form.old_price) fd.append('old_price', form.old_price)
    fd.append('tag', form.tag)
    fd.append('in_stock', String(form.in_stock))
    images.forEach((img) => fd.append('images', img))

    try {
      if (editId) {
        await productsApi.adminUpdate(editId, fd)
      } else {
        await productsApi.adminCreate(fd)
      }
      resetForm()
      loadData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return
    await productsApi.adminDelete(id)
    loadData()
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14,
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Товары</h2>
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

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'var(--white)', borderRadius: 14,
          padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            {editId ? 'Редактировать товар' : 'Новый товар'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={inputStyle} placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Выберите категорию</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inputStyle} placeholder="Цена за кг" type="number" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за шт" type="number" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за уп" type="number" value={form.price_per_pack} onChange={(e) => setForm({ ...form, price_per_pack: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за ящик" type="number" value={form.price_per_box} onChange={(e) => setForm({ ...form, price_per_box: e.target.value })} />
            </div>

            <input style={inputStyle} placeholder="Старая цена (для акций)" type="number" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} />

            <select style={inputStyle} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
              <option value="">Без метки</option>
              <option value="hit">Хит</option>
              <option value="sale">Акция</option>
              <option value="recommended">Советую</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />
              В наличии
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: 'var(--green-main)', color: 'white',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {editId ? 'Сохранить' : 'Создать'}
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'var(--bg)', fontSize: 14,
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--white)', borderRadius: 12,
                padding: 12, boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 8, background: '#f0f0f0',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {p.main_image ? (
                  <img src={p.main_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍎</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {p.category_name}
                  {p.tag && ` · ${TAG_LABELS[p.tag]}`}
                  {!p.in_stock && ' · Нет в наличии'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(p)} style={{ background: 'var(--green-bg)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--green-main)' }}>
                  ✏️
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#FFF3F0', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--red)' }}>
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
