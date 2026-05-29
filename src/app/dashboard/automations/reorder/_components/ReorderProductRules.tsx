import { Plus, Loader2 } from 'lucide-react'
import type { ProductRule, ShopifyProductOption } from '@/types/reorder'
import type { ValidationErrors } from '../_hooks/useReorderSettings'
import { ProductRuleRow } from './ProductRuleRow'

interface Props {
  rules:           ProductRule[]
  shopifyProducts: ShopifyProductOption[]
  productsLoading: boolean
  validationErrors: ValidationErrors
  onAdd:           () => void
  onUpdate:        (productId: string, updates: Partial<ProductRule>) => void
  onRemove:        (productId: string) => void
}

export function ReorderProductRules({
  rules, shopifyProducts, productsLoading,
  validationErrors, onAdd, onUpdate, onRemove,
}: Props) {
  const takenIds = rules.map(r => r.product_id)

  return (
    <div className="flex flex-col gap-3">
      {rules.map((rule, i) => (
        <ProductRuleRow
          key={rule.product_id + i}
          rule={rule}
          index={i}
          shopifyProducts={shopifyProducts}
          takenProductIds={takenIds.filter(id => id !== rule.product_id)}
          onUpdate={onUpdate}
          onRemove={onRemove}
          validationError={validationErrors[`rule_${i}_reminder_days`]}
        />
      ))}

      <button
        onClick={onAdd}
        disabled={productsLoading}
        className="flex items-center gap-2 self-start"
        style={{
          padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px dashed var(--border)', background: 'transparent',
          color: 'var(--text-muted)', cursor: productsLoading ? 'not-allowed' : 'pointer',
          opacity: productsLoading ? 0.6 : 1,
        }}
      >
        {productsLoading
          ? <Loader2 size={13} className="animate-spin" />
          : <Plus size={13} />}
        Add product rule
      </button>

      {shopifyProducts.length === 0 && !productsLoading && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          No Shopify products found. Connect your store in{' '}
          <a href="/dashboard/settings/shopify" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>
            Settings → Shopify
          </a>{' '}
          to enable product-specific rules.
        </p>
      )}
    </div>
  )
}
