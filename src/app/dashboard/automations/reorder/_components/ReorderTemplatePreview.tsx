'use client'

import { TemplatePreviewPhone } from '@/app/dashboard/templates/_components/TemplatePreviewPhone'

const BODY = `Hi {{1}}! 🌿

Your {{2}} should be almost done by now ({{3}} days since delivery!)

Ready to reorder before you run out? ✨

─────────────────────
Reply STOP to unsubscribe`

interface Props {
  defaultReminderDays: number
}

export function ReorderTemplatePreview({ defaultReminderDays }: Props) {
  const vars: Record<string, string> = {
    '1': 'Priya',
    '2': 'Rose Glow Serum',
    '3': String(defaultReminderDays),
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--cream-2)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-dark)', fontSize: 15 }}>
        Message Preview
      </h3>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Sample message your customers will receive
      </p>

      <TemplatePreviewPhone
        body={BODY}
        variableValues={vars}
        buttons={[{ id: 'reorder', text: 'Reorder now →', subtype: 'URL', value: 'https://yourstore.myshopify.com' }]}
      />

      <div className="mt-4 flex flex-col gap-2">
        <div className="rounded-xl p-3" style={{ background: 'rgba(56,0,8,0.04)', border: '1px solid rgba(56,0,8,0.08)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Template must be approved by Meta before going live.{' '}
            <a href="/dashboard/templates" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>
              Go to Templates →
            </a>
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
            ⚠️ The STOP unsubscribe option is required by Meta for all marketing messages and cannot be removed.
          </p>
        </div>
      </div>
    </div>
  )
}
