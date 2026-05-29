'use client'

import { useState } from 'react'
import { useCampaignAnalytics } from './_hooks/useCampaignAnalytics'
import { useCampaignDetail } from './_hooks/useCampaignDetail'
import { CampaignAnalyticsHeader } from './_components/CampaignAnalyticsHeader'
import { OverallStatsRow } from './_components/OverallStatsRow'
import { CampaignTable } from './_components/CampaignTable'
import { CampaignDetailDrawer } from './_components/CampaignDetailDrawer'

export default function CampaignsAnalyticsPage() {
  const { period, setPeriod, campaigns, overallStats, loading } = useCampaignAnalytics()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { campaign, recipients, loading: detailLoading } = useCampaignDetail(selectedId)

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CampaignAnalyticsHeader period={period} setPeriod={setPeriod} campaigns={campaigns} />
      <OverallStatsRow stats={overallStats} loading={loading} />
      <CampaignTable campaigns={campaigns} loading={loading} onSelectCampaign={setSelectedId} />
      <CampaignDetailDrawer
        campaign={campaign}
        recipients={recipients}
        loading={detailLoading}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
