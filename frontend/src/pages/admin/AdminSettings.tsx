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

export default function AdminSettings() {
  const navigate = useNavigate()
  const [minOrderSum, setMinOrderSum] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<ListItem[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<ListItem[]>([])
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
      setPaymentMethods(pm)
      setDeliveryMethods(dm)
      setDistricts(dd)
      setIntervals(di)
    } catch (e) { console.error(e) }
  }

  const handleSaveMinSum = async () => {
    try {
      await settingsApi.updateShopSettings({ min_order_sum: parseFloat(minOrderSum) || 0 })
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Настройки магазина</h2>

      {/* Min order sum */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Минимальная сумма заказа</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={minOrderSum}
            onChange={(e) => setMinOrderSum(e.target.value)}
            type="number"
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e0e0e0', fontSize: 14,
            }}
          />
          <button onClick={handleSaveMinSum} style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'var(--green-main)', color: 'white',
            fontSize: 13, fontWeight: 600,
          }}>
            Сохранить
          </button>
        </div>
      </div>

      <SettingsSection
        title="Способы оплаты"
        items={paymentMethods}
        onAdd={async (name) => { await settingsApi.createPaymentMethod({ name }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deletePaymentMethod(id); loadAll() }}
      />

      <SettingsSection
        title="Способы доставки"
        items={deliveryMethods}
        onAdd={async (name) => { await settingsApi.createDeliveryMethod({ name }); loadAll() }}
        onDelete={async (id) => { await settingsApi.deleteDeliveryMethod(id); loadAll() }}
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
