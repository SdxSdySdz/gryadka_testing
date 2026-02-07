import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import PromoBlocks from '../components/PromoBlock'
import CategoryPill from '../components/CategoryPill'
import ProductCard from '../components/ProductCard'
import { productsApi, categoriesApi } from '../api/products'
import type { Product, Category } from '../types'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error)
    loadProducts()
  }, [])

  const loadProducts = async (categoryId?: number | null, searchQuery?: string) => {
    try {
      setLoading(true)
      const params: any = { in_stock: '1' }
      if (categoryId) params.category = categoryId
      if (searchQuery) params.search = searchQuery
      const data = await productsApi.list(params)
      setProducts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (id: number | null) => {
    setActiveCategory(id)
    loadProducts(id, search)
  }

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search)}`)
    }
  }

  return (
    <div>
      <Header />
      <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
      <PromoBlocks />

      {/* Categories */}
      <div style={{ padding: '16px 16px 0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Категории</h3>
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
        }}>
          <CategoryPill
            category={null}
            active={activeCategory === null}
            onClick={() => handleCategoryClick(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              active={activeCategory === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Popular products */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Популярные товары</h3>
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
