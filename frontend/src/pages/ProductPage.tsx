import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi } from '../api/products'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { Product, PriceType } from '../types'
import { PRICE_TYPE_LABELS, TAG_LABELS } from '../types'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPrice, setSelectedPrice] = useState<PriceType>('kg')
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isFavorite } = useFavoritesStore()
  const [added, setAdded] = useState(false)

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  useEffect(() => {
    if (!id) return
    productsApi.detail(Number(id)).then((data) => {
      setProduct(data)
      // Select first available price type
      if (data.price_per_kg) setSelectedPrice('kg')
      else if (data.price_per_unit) setSelectedPrice('unit')
      else if (data.price_per_pack) setSelectedPrice('pack')
      else if (data.price_per_box) setSelectedPrice('box')
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>
  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Товар не найден</div>

  const priceOptions = ([
    { type: 'kg' as PriceType, value: product.price_per_kg },
    { type: 'unit' as PriceType, value: product.price_per_unit },
    { type: 'pack' as PriceType, value: product.price_per_pack },
    { type: 'box' as PriceType, value: product.price_per_box },
  ] as { type: PriceType; value: string | null }[]).filter((o) => o.value !== null)

  const currentPrice = priceOptions.find((o) => o.type === selectedPrice)?.value || '0'
  const fav = isFavorite(product.id)
  const tagColor = product.tag === 'sale' ? 'var(--red)' : product.tag === 'hit' ? '#FFC107' : 'var(--green-main)'

  const handleAdd = () => {
    addItem(product, selectedPrice)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>
      {/* Image gallery */}
      <div style={{ position: 'relative', height: 300, background: '#f0f0f0' }}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[selectedImage]?.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
            🍎
          </div>
        )}

        {/* Tag */}
        {product.tag && (
          <span style={{
            position: 'absolute', top: 16, left: 16,
            background: tagColor,
            color: product.tag === 'hit' ? '#333' : 'white',
            padding: '4px 12px', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
          }}>
            {TAG_LABELS[product.tag]}
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={() => toggle(product.id)}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.9)', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={fav ? 'var(--red)' : 'none'} stroke={fav ? 'var(--red)' : '#666'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Image dots */}
        {product.images && product.images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 12, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 6,
          }}>
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === selectedImage ? 'var(--green-main)' : 'rgba(255,255,255,0.6)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{product.name}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          {product.description || 'Свежий продукт от местных фермеров'}
        </p>

        {/* Price selector */}
        {priceOptions.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {priceOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedPrice(opt.type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: selectedPrice === opt.type ? 600 : 400,
                  background: selectedPrice === opt.type ? 'var(--green-bg)' : 'var(--bg)',
                  color: selectedPrice === opt.type ? 'var(--green-main)' : 'var(--text-secondary)',
                  border: selectedPrice === opt.type ? '1px solid var(--green-main)' : '1px solid transparent',
                }}
              >
                {PRICE_TYPE_LABELS[opt.type]}
              </button>
            ))}
          </div>
        )}

        {/* Price display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-main)' }}>
            {parseFloat(currentPrice).toFixed(0)} ₽
          </span>
          {product.old_price && (
            <span style={{ fontSize: 16, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
              {parseFloat(product.old_price).toFixed(0)} ₽
            </span>
          )}
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {PRICE_TYPE_LABELS[selectedPrice]}
          </span>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={!product.in_stock}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            background: product.in_stock
              ? (added ? 'var(--green-light)' : 'linear-gradient(135deg, var(--green-dark), var(--green-light))')
              : '#ccc',
            color: 'white',
            transition: 'all 0.2s',
          }}
        >
          {!product.in_stock ? 'Нет в наличии' : added ? 'Добавлено!' : 'В корзину'}
        </button>
      </div>
    </div>
  )
}
