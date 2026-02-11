import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { productsApi, categoriesApi } from '../../api/products'
import type { Product, Category } from '../../types'
import { TAG_LABELS, formatWeight } from '../../types'

/** Parse comma-separated grams string into sorted number array */
function parseGrams(s: string): number[] {
  if (!s) return []
  return s.split(',').map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n) && n > 0).sort((a, b) => a - b)
}

export default function AdminCategoryProducts() {
  const navigate = useNavigate()
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const catId = Number(categoryId)
  const editFromQuery = searchParams.get('edit')

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', description: '',
    price_per_kg: '', price_per_unit: '', price_per_pack: '', price_per_box: '',
    price_per_100g: '', available_grams: '',
    box_weight: '', pack_weight: '',
    old_price: '', tag: '', in_stock: true,
  })
  const [gramsList, setGramsList] = useState<number[]>([])
  const [newGramValue, setNewGramValue] = useState('')
  const [images, setImages] = useState<File[]>([])

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveCategoryId, setMoveCategoryId] = useState<number | null>(null)

  useAppBackButton(useCallback(() => navigate('/admin/categories'), [navigate]))

  useEffect(() => {
    loadData()
  }, [catId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allProducts, cats] = await Promise.all([
        productsApi.adminList(),
        categoriesApi.adminList(),
      ])
      const cat = cats.find((c: Category) => c.id === catId) || null
      setCategory(cat)
      setAllCategories(cats)
      setProducts(allProducts.filter((p: Product) => p.category === catId))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Auto-open edit form when navigated with ?edit=ID
  useEffect(() => {
    if (editFromQuery && products.length > 0 && !showForm) {
      const productToEdit = products.find((p) => p.id === Number(editFromQuery))
      if (productToEdit) {
        handleEdit(productToEdit)
        // Clear the query param so it doesn't re-trigger
        setSearchParams({}, { replace: true })
      }
    }
  }, [editFromQuery, products])

  const resetForm = () => {
    setForm({
      name: '', description: '',
      price_per_kg: '', price_per_unit: '', price_per_pack: '', price_per_box: '',
      price_per_100g: '', available_grams: '',
      box_weight: '', pack_weight: '',
      old_price: '', tag: '', in_stock: true,
    })
    setGramsList([])
    setNewGramValue('')
    setImages([])
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    const grams = parseGrams(p.available_grams || '')
    setForm({
      name: p.name,
      description: p.description || '',
      price_per_kg: p.price_per_kg || '',
      price_per_unit: p.price_per_unit || '',
      price_per_pack: p.price_per_pack || '',
      price_per_box: p.price_per_box || '',
      price_per_100g: p.price_per_100g || '',
      available_grams: grams.join(','),
      box_weight: p.box_weight != null ? String(p.box_weight) : '',
      pack_weight: p.pack_weight != null ? String(p.pack_weight) : '',
      old_price: p.old_price || '',
      tag: p.tag,
      in_stock: p.in_stock,
    })
    setGramsList(grams)
    setNewGramValue('')
    setEditId(p.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('category', String(catId))
    fd.append('description', form.description)
    if (form.price_per_kg) fd.append('price_per_kg', form.price_per_kg)
    if (form.price_per_unit) fd.append('price_per_unit', form.price_per_unit)
    if (form.price_per_pack) fd.append('price_per_pack', form.price_per_pack)
    if (form.price_per_box) fd.append('price_per_box', form.price_per_box)
    if (form.price_per_100g) fd.append('price_per_100g', form.price_per_100g)
    fd.append('available_grams', gramsList.join(','))
    if (form.box_weight) fd.append('box_weight', form.box_weight)
    if (form.pack_weight) fd.append('pack_weight', form.pack_weight)
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
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.error || e?.response?.data?.detail || e?.message || 'Ошибка'
      alert(`Ошибка: ${msg}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return
    try {
      await productsApi.adminDelete(id)
      loadData()
    } catch (e) { console.error(e) }
  }

  // Bulk actions
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulk = async (action: string, categoryIdParam?: number) => {
    if (action === 'delete' && !confirm(`Удалить ${selectedIds.size} товаров?`)) return
    try {
      await productsApi.adminBulk(Array.from(selectedIds), action, categoryIdParam)
      setSelectedIds(new Set())
      setShowMoveModal(false)
      loadData()
    } catch (e) { console.error(e) }
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const otherCategories = allCategories.filter((c) => c.id !== catId)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box',
  }

  /** Build a summary of prices for the product list */
  function priceSummary(p: Product): string {
    const parts: string[] = []
    if (p.price_per_kg) parts.push(`${parseFloat(p.price_per_kg).toFixed(0)} ₽/кг`)
    if (p.price_per_100g) parts.push(`${parseFloat(p.price_per_100g).toFixed(0)} ₽/100г`)
    if (p.price_per_pack) {
      const w = p.pack_weight ? ` (${formatWeight(p.pack_weight)})` : ''
      parts.push(`${parseFloat(p.price_per_pack).toFixed(0)} ₽/уп${w}`)
    }
    if (p.price_per_box) {
      const w = p.box_weight ? ` (${formatWeight(p.box_weight)})` : ''
      parts.push(`${parseFloat(p.price_per_box).toFixed(0)} ₽/ящ${w}`)
    }
    if (p.price_per_unit) parts.push(`${parseFloat(p.price_per_unit).toFixed(0)} ₽/шт`)
    return parts.join(' · ') || 'Нет цены'
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Категория</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{category?.name || 'Загрузка...'}</h2>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'var(--green-main)', color: 'white',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >
          + Товар
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

            <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Цены (заполните хотя бы одну)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inputStyle} placeholder="Цена за кг" type="number" step="0.01" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за шт" type="number" step="0.01" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за уп" type="number" step="0.01" value={form.price_per_pack} onChange={(e) => setForm({ ...form, price_per_pack: e.target.value })} />
              <input style={inputStyle} placeholder="Цена за ящик" type="number" step="0.01" value={form.price_per_box} onChange={(e) => setForm({ ...form, price_per_box: e.target.value })} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>Граммовки</div>
            <input style={inputStyle} placeholder="Цена за 100г" type="number" step="0.01" value={form.price_per_100g} onChange={(e) => setForm({ ...form, price_per_100g: e.target.value })} />

            {/* Grammage chips + add */}
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Граммовка, г"
                  type="number"
                  min="1"
                  value={newGramValue}
                  onChange={(e) => setNewGramValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const v = parseInt(newGramValue, 10)
                      if (v > 0 && !gramsList.includes(v)) {
                        const next = [...gramsList, v].sort((a, b) => a - b)
                        setGramsList(next)
                        setForm({ ...form, available_grams: next.join(',') })
                      }
                      setNewGramValue('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = parseInt(newGramValue, 10)
                    if (v > 0 && !gramsList.includes(v)) {
                      const next = [...gramsList, v].sort((a, b) => a - b)
                      setGramsList(next)
                      setForm({ ...form, available_grams: next.join(',') })
                    }
                    setNewGramValue('')
                  }}
                  style={{
                    padding: '10px 16px', borderRadius: 8,
                    background: 'var(--green-main)', color: 'white',
                    fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                  }}
                >
                  +
                </button>
              </div>
              {gramsList.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {gramsList.map((g) => (
                    <span
                      key={g}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'var(--green-bg)', color: 'var(--green-main)',
                        padding: '4px 10px', borderRadius: 8,
                        fontSize: 13, fontWeight: 500,
                      }}
                    >
                      {formatWeight(g)}
                      <button
                        type="button"
                        onClick={() => {
                          const next = gramsList.filter((x) => x !== g)
                          setGramsList(next)
                          setForm({ ...form, available_grams: next.join(',') })
                        }}
                        style={{
                          background: 'none', padding: 0, marginLeft: 2,
                          color: 'var(--green-main)', fontSize: 14, lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>Масса упаковки / коробки (в граммах)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inputStyle} placeholder="Масса упаковки (г)" type="number" value={form.pack_weight} onChange={(e) => setForm({ ...form, pack_weight: e.target.value })} />
              <input style={inputStyle} placeholder="Масса коробки (г)" type="number" value={form.box_weight} onChange={(e) => setForm({ ...form, box_weight: e.target.value })} />
            </div>

            <input style={inputStyle} placeholder="Старая цена (для акций)" type="number" step="0.01" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} />

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

      {/* Select all + bulk actions */}
      {products.length > 0 && (
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
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {otherCategories.length > 0 && (
                <button
                  onClick={() => { setMoveCategoryId(otherCategories[0]?.id || null); setShowMoveModal(true) }}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: '#E3F2FD', color: '#2196F3',
                  }}
                >
                  Переместить
                </button>
              )}
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

      {/* Products list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Загрузка...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          В этой категории пока нет товаров
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: selectedIds.has(p.id) ? 'var(--green-bg)' : 'var(--white)',
                borderRadius: 12,
                padding: 12, boxShadow: 'var(--shadow)',
                display: 'flex', alignItems: 'center', gap: 12,
                border: selectedIds.has(p.id) ? '1px solid var(--green-main)' : '1px solid transparent',
                opacity: p.in_stock ? 1 : 0.6,
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--green-main)', flexShrink: 0 }}
              />

              <div style={{
                width: 50, height: 50, borderRadius: 8, background: '#f0f0f0',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {p.main_image ? (
                  <img src={p.main_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍎</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {priceSummary(p)}
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

      {/* Move to category modal */}
      {showMoveModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 16,
        }}
          onClick={() => setShowMoveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--white)', borderRadius: 16,
              padding: 20, width: '100%', maxWidth: 360,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
              Переместить {selectedIds.size} товаров
            </h3>
            <select
              value={moveCategoryId || ''}
              onChange={(e) => setMoveCategoryId(Number(e.target.value))}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: '1px solid #e0e0e0', fontSize: 14,
                boxSizing: 'border-box', marginBottom: 12,
              }}
            >
              {otherCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => moveCategoryId && handleBulk('move', moveCategoryId)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  background: 'var(--green-main)', color: 'white',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                Переместить
              </button>
              <button
                onClick={() => setShowMoveModal(false)}
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
