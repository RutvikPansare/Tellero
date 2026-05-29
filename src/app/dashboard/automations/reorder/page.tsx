'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReorderSettingsCard }    from './_components/ReorderSettingsCard'
import { ReorderTemplatePreview } from './_components/ReorderTemplatePreview'
import { ReorderStatsCard }       from './_components/ReorderStatsCard'
import { ReorderLog }             from './_components/ReorderLog'
import { useReorderSettings }     from './_hooks/useReorderSettings'
import { useReorderLog }          from './_hooks/useReorderLog'

export default function ReorderPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const {
    settings, shopifyProducts, productsLoading, loading: settingsLoading,
    saving, error, validationErrors, updateSettings,
    addProductRule, updateProductRule, removeProductRule,
  } = useReorderSettings(userId ?? '')

  const log = useReorderLog(userId ?? '')

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--burgundy)' }} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-bold" style={{ fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>
            Reorder Reminders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            Bring customers back before they run out — automatically
          </p>
        </div>

        <ReorderStatsCard stats={log.stats} loading={log.loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReorderSettingsCard
            settings={settings}
            shopifyProducts={shopifyProducts}
            productsLoading={productsLoading}
            loading={settingsLoading}
            saving={saving}
            error={error}
            validationErrors={validationErrors}
            stats={log.stats}
            statsLoading={log.loading}
            onUpdate={updateSettings}
            onAddRule={addProductRule}
            onUpdateRule={updateProductRule}
            onRemoveRule={removeProductRule}
          />
          <ReorderTemplatePreview defaultReminderDays={settings.default_reminder_days} />
        </div>

        <ReorderLog log={log} />
      </div>
    </div>
  )
}
