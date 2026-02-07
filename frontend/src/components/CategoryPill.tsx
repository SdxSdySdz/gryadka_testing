import type { Category } from '../types'

interface Props {
  category: Category | null  // null = "Все"
  active: boolean
  onClick: () => void
}

const defaultIcons: Record<string, string> = {
  'Все': '🍊🍇🍐🍓',
  'Ягоды': '🍓',
  'Цитрусовые': '🍊',
  'Тропические': '🍍',
  'Овощи': '🥬',
  'Фрукты': '🍎',
}

export default function CategoryPill({ category, active, onClick }: Props) {
  const name = category?.name || 'Все'
  const hasImage = category?.image

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        minWidth: 64,
        padding: 0,
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--white)',
        border: active ? '2px solid var(--green-main)' : '2px solid transparent',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {hasImage ? (
          <img src={category!.image!} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: name === 'Все' ? 14 : 24 }}>
            {defaultIcons[name] || '🍽️'}
          </span>
        )}
      </div>
      <span style={{
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--green-main)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
      }}>
        {name}
      </span>
    </button>
  )
}
