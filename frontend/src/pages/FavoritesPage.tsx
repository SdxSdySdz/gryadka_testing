import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { useFavoritesStore } from '../store/favoritesStore'
import { productsApi } from '../api/products'
import type { Product } from '../types'

export default function FavoritesPage() {
  const { ids } = useFavoritesStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    productsApi.list().then((all) => {
      setProducts(all.filter((p) => ids.includes(p.id)))
    }).catch(console.error).finally(() => setLoading(false))
  }, [ids])

  return (
    <div>
      <Header />
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Избранное</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Загрузка...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>💚</div>
            <p style={{ color: 'var(--text-secondary)' }}>Нет избранных товаров</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
