'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CODSettingsCard } from './_components/CODSettingsCard'
import { CODTemplatePreview } from './_components/CODTemplatePreview'
import { CODStatsCard } from './_components/CODStatsCard'
import { CODConfirmationLog } from './_components/CODConfirmationLog'
import { useCODSettings } from './_hooks/useCODSettings'
import { useCODLog } from './_hooks/useCODLog'

export default function CODPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const { settings, loading: settingsLoading, saving, error: settingsError,
          monthlyCODOrders, estimatedSavings, updateSettings } = useCODSettings(userId ?? '')
  const { confirmations, stats, loading: logLoading, error: logError } = useCODLog(userId ?? '')

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--burgundy)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-bold" style={{ fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>
          COD Confirmation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
          Reduce Cash on Delivery returns by confirming orders via WhatsApp
        </p>
      </div>

      {/* Stats row */}
      <CODStatsCard stats={stats} loading={logLoading} />

      {/* Settings + preview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CODSettingsCard
          settings={settings}
          loading={settingsLoading}
          saving={saving}
          error={settingsError}
          monthlyCODOrders={monthlyCODOrders}
          estimatedSavings={estimatedSavings}
          onUpdate={updateSettings}
        />
        <CODTemplatePreview />
      </div>

      {/* Confirmation log */}
      <CODConfirmationLog
          confirmations={confirmations}
          loading={logLoading}
          error={logError}
        />
      </div>
    </div>
  )
}
