import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { settingsApi } from '../../api/settings'

interface ListItem {
  id: number
  name?: string
  label?: string
}

function SettingsSection({
  title,
  items,
  onAdd,
  onDelete,
  nameField = 'name',
}: {
  title: string
  items: ListItem[]
  onAdd: (value: string) => void
  onDelete: (id: number) => void
  nameField?: 'name' | 'label'
}) {
  const [value, setValue] = useState('')

  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Новый: ${title.toLowerCase()}`}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e0e0e0', fontSize: 14,
          }}
        />
        <button
          onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue('') } }}
          style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'var(--green-main)', color: 'white',
            fontSize: 13, fontWeight: 600,
          }}
        >
          +
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <div key={item.id} style={{
            background: 'var(--white)', borderRadius: 10, padding: '10px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow)',
          }}>
            <span style={{ fontSize: 14 }}>{nameField === 'label' ? item.label : item.name}</span>
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', color: 'var(--red)', fontSize: 12 }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DeliveryItem {
  id: number
  name: string
  price: string
}

function DeliveryMethodsSection({
  items,
  onAdd,
  onDelete,
  onUpdatePrice,
}: {
  items: DeliveryItem[]
  onAdd: (name: string, price: number) => void
  onDelete: (id: number) => void
  onUpdatePrice: (id: number, price: number) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Способы доставки</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e0e0e0', fontSize: 14,
          }}
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена ₽"
          type="number"
          style={{
            width: 80, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e0e0e0', fontSize: 14,
          }}
        />
        <button
          onClick={() => {
            if (name.trim()) {
              onAdd(name.trim(), parseFloat(price) || 0)
              setName('')
              setPrice('')
            }
          }}
          style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'var(--green-main)', color: 'white',
            fontSize: 13, fontWeight: 600,
          }}
        >
          +
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <div key={item.id} style={{
            background: 'var(--white)', borderRadius: 10, padding: '10px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow)', gap: 8,
          }}>
            <span style={{ fontSize: 14, flex: 1 }}>{item.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                defaultValue={parseFloat(item.price).toFixed(0)}
                type="number"
                onBlur={(e) => onUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                style={{
                  width: 70, padding: '6px 8px', borderRadius: 6,
                  border: '1px solid #e0e0e0', fontSize: 13, textAlign: 'right',
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>₽</span>
            </div>
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', color: 'var(--red)', fontSize: 12 }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const navigate = useNavigate()
  const [minOrderSum, setMinOrderSum] = useState('')
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('')
  const [urgencySurcharge, setUrgencySurcharge] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<ListItem[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryItem[]>([])
  const [districts, setDistricts] = useState<ListItem[]>([])
  const [intervals, setIntervals] = useState<ListItem[]>([])

  useAppBackButton(useCallback(() => navigate('/profile'), [navigate]))

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [shopSettings, pm, dm, dd, di] = await Promise.all([
        settingsApi.getShopSettings(),
        settingsApi.getPaymentMethods(),
        settingsApi.getDeliveryMethods(),
        settingsApi.getDeliveryDistricts(),
        settingsApi.getDeliveryIntervals(),
      ])
      setMinOrderSum(shopSettings.min_order_sum)
      setFreeDeliveryThreshold(shopSettings.free_delivery_threshold || '5000')
      setUrgencySurcharge(shopSettings.urgency_surcharge || '0')
      setPaymentMethods(pm)
      setDeliveryMethods(dm)
      setDistricts(dd)
      setIntervals(di)
    } catch (e) { console.error(e) }
  }

  const handleSaveSettings = async () => {
    try {
      await settingsApi.updateShopSettings({
        min_order_sum: parseFloat(minOrderSum) || 0,
        free_delivery_threshold: parseFloat(freeDeliveryThreshold) || 0,
        urgency_surcharge: parseFloat(urgencySurcharge) || 0,
      })
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Настройки магазина</h2>

      {/* Shop settings */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Основные настройки</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              Минимальная сумма заказа (₽)
            </label>
            <input
              value={minOrderSum}
              onChange={(e) => setMinOrderSum(e.target.value)}
              type="number"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e0e0e0', fontSize: 14,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              Бесплатная доставка от (₽)
            </label>
            <input
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              type="number"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e0e0e0', fontSize: 14,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
              Наценка за срочность (₽)
            </label>
            <input
              value={urgencySurcharge}
              onChange={(e) => setUrgencySurcharge(e.target.value)}
              type="number"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e0e0e0', fontSize: 14,
              }}
            />
          </div>
          <button onClick={handleSaveSettings} style={{
            padding: '12px 16px', borderRadius: 8,
            background: 'var(--green-main)', color: 'white',
            fontSize: 14, fontWeight: 600,
          }}>
            Сохранить настройки
          </button>
        </div>
      </div>

      <SettingsSection
        title="Способы оплаты"
        items={paymentMethods}
        onAdd={async (name) => { await settingsApi.createPaymentMethod({ name }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deletePaymentMethod(id); loadAll() }}
      />

      <DeliveryMethodsSection
        items={deliveryMethods}
        onAdd={async (name, price) => { await settingsApi.createDeliveryMethod({ name, price }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deleteDeliveryMethod(id); loadAll() }}
        onUpdatePrice={async (id, price) => { await settingsApi.updateDeliveryMethod(id, { price }); loadAll() }}
      />

      <SettingsSection
        title="Районы доставки"
        items={districts}
        onAdd={async (name) => { await settingsApi.createDeliveryDistrict({ name }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deleteDeliveryDistrict(id); loadAll() }}
      />

      <SettingsSection
        title="Интервалы доставки"
        items={intervals}
        nameField="label"
        onAdd={async (label) => { await settingsApi.createDeliveryInterval({ label }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deleteDeliveryInterval(id); loadAll() }}
      />
    </div>
  )
}
