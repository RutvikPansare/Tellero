import Link from 'next/link'
import { TemplatePreviewPhone } from '@/app/dashboard/templates/_components/TemplatePreviewPhone'
import { ExternalLink } from 'lucide-react'

const CART_TEMPLATE_BODY = `Hi {{1}}! 👋

You left something in your cart ✨

{{2}} × {{3}} — ₹{{4}}

Complete your order before it sells out:
{{5}}`

const SAMPLE_VARIABLES: Record<string, string> = {
  '1': 'Priya',
  '2': 'Rose Glow Serum',
  '3': '1',
  '4': '799',
  '5': 'https://store.myshopify.com/checkout/recover/...',
}

export function AbandonedCartTemplatePreview() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}
    >
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-dark)', fontSize: 15 }}>
        Message Preview
      </h3>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        This is what your customers will receive
      </p>

      <TemplatePreviewPhone
        body={CART_TEMPLATE_BODY}
        variableValues={SAMPLE_VARIABLES}
        buttons={[{ id: 'cta', text: 'Complete purchase →', subtype: 'URL', value: 'https://store.myshopify.com/checkout/recover/' }]}
      />

      <div
        className="mt-4 rounded-xl p-3"
        style={{ background: 'rgba(56,0,8,0.04)', border: '1px solid rgba(56,0,8,0.08)' }}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          The cart link expires after 24 hours (Shopify&apos;s default).
          Sending within 60 minutes maximises recovery rate.
        </p>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-1 mt-2"
          style={{ fontSize: 12, color: 'var(--burgundy)', fontWeight: 600, textDecoration: 'none' }}
        >
          Submit this template →
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  )
}
