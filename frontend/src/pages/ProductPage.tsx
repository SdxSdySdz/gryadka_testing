import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi } from '../api/products'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useUserStore } from '../store/userStore'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { Product, PriceType } from '../types'
import { TAG_LABELS, formatWeight } from '../types'

/** Parse available_grams string "250,300,500" into number array */
function parseAvailableGrams(s: string): number[] {
  if (!s) return []
  return s
    .split(',')
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
}

/** Build the list of available price options for this product, in priority order */
function buildPriceOptions(product: Product) {
  const opts: { type: PriceType; label: string; value: string }[] = []

  if (product.price_per_kg) {
    opts.push({ type: 'kg', label: 'за кг', value: product.price_per_kg })
  }
  if (product.price_per_100g) {
    opts.push({ type: 'gram', label: 'за 100г', value: product.price_per_100g })
  }
  if (product.price_per_unit) {
    opts.push({ type: 'unit', label: 'за шт', value: product.price_per_unit })
  }
  if (product.price_per_pack) {
    const w = product.pack_weight ? ` (${formatWeight(product.pack_weight)})` : ''
    opts.push({ type: 'pack', label: `за уп${w}`, value: product.price_per_pack })
  }
  if (product.price_per_box) {
    const w = product.box_weight ? ` (${formatWeight(product.box_weight)})` : ''
    opts.push({ type: 'box', label: `за ящ${w}`, value: product.price_per_box })
  }
  return opts
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPrice, setSelectedPrice] = useState<PriceType>('kg')
  const [selectedGrams, setSelectedGrams] = useState<number>(0)
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isFavorite } = useFavoritesStore()
  const user = useUserStore((s) => s.user)
  const [added, setAdded] = useState(false)

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  useEffect(() => {
    if (!id) return
    productsApi.detail(Number(id)).then((data) => {
      setProduct(data)
      // Select first available price type by priority
      const opts = buildPriceOptions(data)
      if (opts.length > 0) {
        setSelectedPrice(opts[0].type)
        // If first option is gram, select first available grammage
        if (opts[0].type === 'gram') {
          const grams = parseAvailableGrams(data.available_grams)
          if (grams.length > 0) setSelectedGrams(grams[0])
        }
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>
  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Товар не найден</div>

  const priceOptions = buildPriceOptions(product)
  const availableGrams = parseAvailableGrams(product.available_grams)

  // Calculate current displayed price
  let currentPrice = '0'
  if (selectedPrice === 'gram' && product.price_per_100g) {
    if (selectedGrams > 0) {
      currentPrice = (parseFloat(product.price_per_100g) * selectedGrams / 100).toFixed(0)
    } else {
      currentPrice = product.price_per_100g
    }
  } else {
    const opt = priceOptions.find((o) => o.type === selectedPrice)
    currentPrice = opt?.value || '0'
  }

  const currentLabel = priceOptions.find((o) => o.type === selectedPrice)?.label || ''

  const fav = isFavorite(product.id)
  const tagColor = product.tag === 'sale' ? 'var(--red)' : product.tag === 'hit' ? '#FFC107' : 'var(--green-main)'

  const handleAdd = () => {
    addItem(product, selectedPrice, selectedPrice === 'gram' ? selectedGrams : undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // For gram type, disable add if no grammage selected
  const canAdd = product.in_stock && (selectedPrice !== 'gram' || selectedGrams > 0)

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

        {/* Price type selector */}
        {priceOptions.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {priceOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  setSelectedPrice(opt.type)
                  if (opt.type === 'gram' && availableGrams.length > 0 && selectedGrams === 0) {
                    setSelectedGrams(availableGrams[0])
                  }
                }}
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
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Gram selector — shown when 'gram' price type is selected */}
        {selectedPrice === 'gram' && availableGrams.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Выберите граммовку:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableGrams.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrams(g)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: selectedGrams === g ? 600 : 400,
                    background: selectedGrams === g ? 'var(--green-bg)' : 'var(--bg)',
                    color: selectedGrams === g ? 'var(--green-main)' : 'var(--text-secondary)',
                    border: selectedGrams === g ? '1px solid var(--green-main)' : '1px solid transparent',
                  }}
                >
                  {formatWeight(g)}
                </button>
              ))}
            </div>
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
            {selectedPrice === 'gram' && selectedGrams > 0
              ? `за ${formatWeight(selectedGrams)}`
              : currentLabel}
          </span>
        </div>

        {/* Price per 100g hint when gram is selected */}
        {selectedPrice === 'gram' && product.price_per_100g && selectedGrams > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, marginTop: -12 }}>
            Цена за 100г: {parseFloat(product.price_per_100g).toFixed(0)} ₽
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            background: !canAdd
              ? '#ccc'
              : (added ? 'var(--green-light)' : 'linear-gradient(135deg, var(--green-dark), var(--green-light))'),
            color: 'white',
            transition: 'all 0.2s',
          }}
        >
          {!product.in_stock ? 'Нет в наличии' : added ? 'Добавлено!' : 'В корзину'}
        </button>

        {/* Admin: open in admin panel */}
        {user?.is_admin && (
          <button
            onClick={() => navigate(`/admin/categories/${product.category}/products?edit=${product.id}`)}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--green-main)',
              border: '1px solid var(--green-main)',
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Открыть в админ-панели
          </button>
        )}
      </div>
    </div>
  )
}
