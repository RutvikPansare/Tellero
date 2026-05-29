'use client'

import { TemplatePreviewPhone } from '@/app/dashboard/templates/_components/TemplatePreviewPhone'

const CONFIRMATION_BODY = `Hi {{1}}! 🎉

Your order {{2}} is confirmed!

{{3}}

Total: ₹{{4}}
Expected delivery: {{5}} days`

const SHIPPING_BODY = `Great news {{1}}! 📦

Your order {{2}} has shipped!

Carrier: {{3}}
Tracking: {{4}}

Track your order below:`

const CONFIRMATION_VARS: Record<string, string> = {
  '1': 'Priya',
  '2': '#1042',
  '3': 'Rose Glow Serum × 1 — ₹799\nVitamin C Toner × 1 — ₹599',
  '4': '1,398',
  '5': '3–5',
}

const SHIPPING_VARS: Record<string, string> = {
  '1': 'Priya',
  '2': '#1042',
  '3': 'Delhivery',
  '4': 'DEL123456789',
}

export function OrderNotificationTemplatePreview() {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-dark)', fontSize: 15 }}>
        Message Previews
      </h3>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Sample messages your customers will receive
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="mb-3 font-semibold" style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Order Confirmation
          </p>
          <TemplatePreviewPhone
            body={CONFIRMATION_BODY}
            variableValues={CONFIRMATION_VARS}
          />
        </div>
        <div>
          <p className="mb-3 font-semibold" style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Shipping Update
          </p>
          <TemplatePreviewPhone
            body={SHIPPING_BODY}
            variableValues={SHIPPING_VARS}
            buttons={[{ id: 'track', text: 'Track now →', subtype: 'URL', value: 'https://track.delhivery.com/' }]}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(56,0,8,0.04)', border: '1px solid rgba(56,0,8,0.08)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Templates must be approved by Meta before going live. Create them in the Templates section and submit for review.
        </p>
      </div>
    </div>
  )
}
