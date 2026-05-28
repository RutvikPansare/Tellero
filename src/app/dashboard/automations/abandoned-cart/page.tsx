'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AbandonedCartSettingsCard } from './_components/AbandonedCartSettingsCard'
import { AbandonedCartTemplatePreview } from './_components/AbandonedCartTemplatePreview'
import { AbandonedCartStatsCard } from './_components/AbandonedCartStatsCard'
import { AbandonedCartLog } from './_components/AbandonedCartLog'
import { useAbandonedCartSettings } from './_hooks/useAbandonedCartSettings'
import { useAbandonedCartLog } from './_hooks/useAbandonedCartLog'

export default function AbandonedCartPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const {
    settings, loading: settingsLoading, saving, error: settingsError,
    monthlyAbandonedCount, monthlyAbandonedValue, estimatedRecovery,
    updateSettings,
  } = useAbandonedCartSettings(userId ?? '')

  const { checkouts, stats, loading: logLoading, error: logError } = useAbandonedCartLog(userId ?? '')

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
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-bold" style={{ fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>
          Abandoned Cart Recovery
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
          Recover lost revenue by reaching customers who left without purchasing
        </p>
      </div>

      <AbandonedCartStatsCard stats={stats} loading={logLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AbandonedCartSettingsCard
          settings={settings}
          loading={settingsLoading}
          saving={saving}
          error={settingsError}
          monthlyAbandonedCount={monthlyAbandonedCount}
          monthlyAbandonedValue={monthlyAbandonedValue}
          estimatedRecovery={estimatedRecovery}
          onUpdate={updateSettings}
        />
        <AbandonedCartTemplatePreview />
      </div>

      <AbandonedCartLog
        checkouts={checkouts}
        loading={logLoading}
        error={logError}
      />
    </div>
  )
}
