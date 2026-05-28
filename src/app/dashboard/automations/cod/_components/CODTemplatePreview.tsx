import Link from 'next/link'
import { TemplatePreviewPhone } from '@/app/dashboard/templates/_components/TemplatePreviewPhone'
import { ExternalLink } from 'lucide-react'

const COD_TEMPLATE_BODY = `Hi {{1}}! 👋

Your COD order {{2}} of ₹{{3}} is ready to ship 📦

Reply *YES* to confirm delivery
Reply *NO* to cancel

We'll hold your order for {{4}} hours.`

const SAMPLE_VARIABLES: Record<string, string> = {
  '1': 'Priya',
  '2': '#1001',
  '3': '1,299',
  '4': '2',
}

export function CODTemplatePreview() {
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
        body={COD_TEMPLATE_BODY}
        variableValues={SAMPLE_VARIABLES}
      />

      <div
        className="mt-4 rounded-xl p-3"
        style={{ background: 'rgba(56,0,8,0.04)', border: '1px solid rgba(56,0,8,0.08)' }}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          This template must be approved by Meta before going live.
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
