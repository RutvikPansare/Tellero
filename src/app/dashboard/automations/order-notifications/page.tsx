'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderNotificationSettingsCard } from './_components/OrderNotificationSettingsCard'
import { OrderNotificationTemplatePreview } from './_components/OrderNotificationTemplatePreview'
import { OrderNotificationStatsCard } from './_components/OrderNotificationStatsCard'
import { OrderNotificationLog } from './_components/OrderNotificationLog'
import { useOrderNotificationSettings } from './_hooks/useOrderNotificationSettings'
import { useOrderNotificationLog } from './_hooks/useOrderNotificationLog'

export default function OrderNotificationsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const {
    settings, loading: settingsLoading, saving, error: settingsError,
    monthlyOrderCount, updateSettings,
  } = useOrderNotificationSettings(userId ?? '')

  const log = useOrderNotificationLog(userId ?? '')

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
            Order Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            Automatically notify customers when orders are placed and shipped
          </p>
        </div>

        {/* Stats row */}
        <OrderNotificationStatsCard stats={log.stats} loading={log.loading} />

        {/* Settings + preview side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OrderNotificationSettingsCard
            settings={settings}
            loading={settingsLoading}
            saving={saving}
            error={settingsError}
            monthlyOrderCount={monthlyOrderCount}
            onUpdate={updateSettings}
          />
          <OrderNotificationTemplatePreview />
        </div>

        {/* Message log */}
        <OrderNotificationLog log={log} />
      </div>
    </div>
  )
}
