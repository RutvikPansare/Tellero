import { X } from 'lucide-react'
import type { ProductRule, ShopifyProductOption } from '@/types/reorder'

interface Props {
  rule:            ProductRule
  index:           number
  shopifyProducts: ShopifyProductOption[]
  takenProductIds: string[]
  onUpdate:        (productId: string, updates: Partial<ProductRule>) => void
  onRemove:        (productId: string) => void
  validationError: string | undefined
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch" aria-checked={on} onClick={onToggle}
      title={on ? 'Disable to pause without deleting' : 'Enable this product rule'}
      style={{
        width: 36, height: 20, borderRadius: 99, border: 'none',
        cursor: 'pointer', background: on ? 'var(--burgundy)' : 'var(--border)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export function ProductRuleRow({ rule, shopifyProducts, takenProductIds, onUpdate, onRemove, validationError }: Props) {
  const productExists = shopifyProducts.some(p => p.id === rule.product_id)
  const rowStyle: React.CSSProperties = {
    opacity: rule.enabled ? 1 : 0.55,
    transition: 'opacity 0.2s',
  }

  return (
    <div style={rowStyle}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Product selector */}
        <select
          value={rule.product_id}
          onChange={e => {
            const prod = shopifyProducts.find(p => p.id === e.target.value)
            onUpdate(rule.product_id, {
              product_id:    e.target.value,
              product_title: prod?.title ?? e.target.value,
            })
          }}
          style={{
            flex: 1, minWidth: 160, padding: '7px 10px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--cream-1)',
            fontSize: 13, color: productExists ? 'var(--text-dark)' : 'var(--text-muted)',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {!productExists && (
            <option value={rule.product_id}>[Deleted product]</option>
          )}
          {shopifyProducts
            .filter(p => p.id === rule.product_id || !takenProductIds.includes(p.id))
            .map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
        </select>

        <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>after</span>

        {/* Days input */}
        <input
          type="number"
          min={7}
          max={365}
          value={rule.reminder_days}
          onChange={e => onUpdate(rule.product_id, { reminder_days: Number(e.target.value) })}
          style={{
            width: 70, padding: '7px 10px', borderRadius: 10,
            border: `1px solid ${validationError ? '#ef4444' : 'var(--border)'}`,
            background: 'var(--cream-1)', fontSize: 13, color: 'var(--text-dark)', outline: 'none',
            textAlign: 'center',
          }}
        />

        <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>days</span>

        {/* Enable/disable toggle */}
        <Toggle on={rule.enabled} onToggle={() => onUpdate(rule.product_id, { enabled: !rule.enabled })} />

        {/* Delete */}
        <button
          onClick={() => onRemove(rule.product_id)}
          style={{
            padding: 4, borderRadius: 8, border: 'none', background: 'transparent',
            cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          title="Remove this rule"
        >
          <X size={15} />
        </button>
      </div>

      {validationError && (
        <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{validationError}</p>
      )}
    </div>
  )
}
