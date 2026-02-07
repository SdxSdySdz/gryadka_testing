import { useNavigate } from 'react-router-dom'
import { useFavoritesStore } from '../store/favoritesStore'
import type { Product } from '../types'
import { TAG_LABELS } from '../types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate()
  const { toggle, isFavorite } = useFavoritesStore()
  const fav = isFavorite(product.id)

  // Get main price and unit label
  let price = ''
  let unit = ''
  if (product.price_per_kg) { price = product.price_per_kg; unit = 'за кг' }
  else if (product.price_per_unit) { price = product.price_per_unit; unit = 'за шт' }
  else if (product.price_per_pack) { price = product.price_per_pack; unit = 'за уп' }
  else if (product.price_per_box) { price = product.price_per_box; unit = 'за ящик' }

  const tagColor = product.tag === 'sale' ? 'var(--red)' : product.tag === 'hit' ? '#FFC107' : 'var(--green-main)'

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: 'var(--white)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        cursor: 'pointer',
        position: 'relative',
        borderBottom: '3px solid var(--green-main)',
      }}
    >
      {/* Image */}
      <div style={{
        height: 140,
        background: '#f0f0f0',
        position: 'relative',
      }}>
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
          }}>
            🍎
          </div>
        )}

        {/* Tag badge */}
        {product.tag && (
          <span style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: tagColor,
            color: product.tag === 'hit' ? '#333' : 'white',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 6,
          }}>
            {TAG_LABELS[product.tag] || product.tag}
          </span>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product.id) }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={fav ? 'var(--red)' : 'none'}
            stroke={fav ? 'var(--red)' : 'var(--text-secondary)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-main)' }}>
            {parseFloat(price).toFixed(0)} ₽
          </span>
          {product.old_price && (
            <span style={{
              fontSize: 12, color: 'var(--text-secondary)',
              textDecoration: 'line-through',
            }}>
              {parseFloat(product.old_price).toFixed(0)} ₽
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>
    </div>
  )
}
