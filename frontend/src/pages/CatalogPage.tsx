import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import CategoryPill from '../components/CategoryPill'
import ProductCard from '../components/ProductCard'
import { productsApi, categoriesApi } from '../api/products'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { Product, Category } from '../types'

export default function CatalogPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  )
  const [activeTag, setActiveTag] = useState<string>(searchParams.get('tag') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [activeCategory, activeTag, search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params: any = { in_stock: '1' }
      if (activeCategory) params.category = activeCategory
      if (activeTag) params.tag = activeTag
      if (search) params.search = search
      const data = await productsApi.list(params)
      setProducts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const title = activeTag === 'sale' ? 'Акции' : activeTag === 'hit' ? 'Хиты' : 'Каталог'

  return (
    <div>
      <Header />
      <SearchBar value={search} onChange={setSearch} />

      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h2>

        {/* Categories row */}
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12,
        }}>
          <CategoryPill
            category={null}
            active={activeCategory === null}
            onClick={() => { setActiveCategory(null); setActiveTag('') }}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              active={activeCategory === cat.id}
              onClick={() => { setActiveCategory(cat.id); setActiveTag('') }}
            />
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div style={{ padding: '0 16px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Загрузка...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Товары не найдены
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
