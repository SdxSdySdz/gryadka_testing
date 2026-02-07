import { useNavigate } from 'react-router-dom'

export default function PromoBlocks() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      padding: '0 16px',
    }}>
      {/* Sale block */}
      <div
        onClick={() => navigate('/catalog?tag=sale')}
        style={{
          background: 'linear-gradient(135deg, #FF9800, #E65100)',
          borderRadius: 16,
          padding: 16,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          minHeight: 140,
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -10, left: -10,
          width: 50, height: 50, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />

        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Акция</span>
        <div style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: '4px 0' }}>-30%</div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Скидки до 30%</span>
        <div style={{
          marginTop: 10,
          background: 'rgba(255,255,255,0.25)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 8,
          display: 'inline-block',
        }}>
          Выбрать &gt;
        </div>
      </div>

      {/* Hits block */}
      <div
        onClick={() => navigate('/catalog?tag=hit')}
        style={{
          background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
          borderRadius: 16,
          padding: 16,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          minHeight: 140,
        }}
      >
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: -10, left: -10,
          width: 50, height: 50, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />

        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Хиты</span>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '4px 0' }}>Популярные</div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Топ товары</span>
        <div style={{
          marginTop: 10,
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 8,
          display: 'inline-block',
        }}>
          Смотреть &gt;
        </div>
      </div>
    </div>
  )
}
