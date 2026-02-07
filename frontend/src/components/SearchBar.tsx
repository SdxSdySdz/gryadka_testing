interface Props {
  value: string
  onChange: (val: string) => void
  onSubmit?: () => void
}

export default function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <div style={{
      padding: '12px 16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--white)',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: 'var(--shadow)',
        gap: 10,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
          placeholder="Поиск фруктов..."
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: 14,
            color: 'var(--text-primary)',
            background: 'transparent',
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              background: 'none',
              padding: 4,
              display: 'flex',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
