export const PLAN_LIMITS = {
  free: {
    max_contacts: 50,
    broadcasts_enabled: false,
    automations_enabled: false,
    inbox_enabled: false,
    shopify_enabled: false,
    ai_bot_enabled: false,
    ai_bot_conversations_per_month: 0,
    instagram_enabled: false,
    analytics_enabled: false,
  },
  starter: {
    max_contacts: Infinity,
    broadcasts_enabled: true,
    automations_enabled: true,
    inbox_enabled: true,
    shopify_enabled: true,
    ai_bot_enabled: true,
    ai_bot_conversations_per_month: 500,
    instagram_enabled: true,
    analytics_enabled: true,
  },
  growth: {
    max_contacts: Infinity,
    broadcasts_enabled: true,
    automations_enabled: true,
    inbox_enabled: true,
    shopify_enabled: true,
    ai_bot_enabled: true,
    ai_bot_conversations_per_month: Infinity,
    instagram_enabled: true,
    analytics_enabled: true,
  },
  scale: {
    max_contacts: Infinity,
    broadcasts_enabled: true,
    automations_enabled: true,
    inbox_enabled: true,
    shopify_enabled: true,
    ai_bot_enabled: true,
    ai_bot_conversations_per_month: Infinity,
    instagram_enabled: true,
    analytics_enabled: true,
  },
} as const

export type PlanName = keyof typeof PLAN_LIMITS
export type PlanLimits = (typeof PLAN_LIMITS)[PlanName]

export function getPlanLimits(plan: PlanName): PlanLimits {
  return PLAN_LIMITS[plan]
}

export function canUseFeature(plan: PlanName, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan]
  const value = limits[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

export const PLAN_DISPLAY: Record<PlanName, { label: string; price: string; priceNum: number; color: string; bg: string }> = {
  free:    { label: 'Free Plan',    price: 'Free',         priceNum: 0,    color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
  starter: { label: 'Starter Plan', price: '₹999/month',  priceNum: 999,  color: '#16A34A', bg: 'rgba(34,197,94,0.08)' },
  growth:  { label: 'Growth Plan',  price: '₹1,799/month', priceNum: 1799, color: '#2563EB', bg: 'rgba(59,130,246,0.08)' },
  scale:   { label: 'Scale Plan',   price: '₹2,999/month', priceNum: 2999, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
}

export const PLAN_FEATURES: Record<PlanName, string[]> = {
  free: [
    'Up to 50 contacts',
    'Basic dashboard',
    'Manual messaging only',
  ],
  starter: [
    'Unlimited contacts',
    'WhatsApp broadcasts',
    'All automations (COD, Cart, Orders, Reorder)',
    'Multi-agent inbox',
    'Shopify integration',
    'AI bot (500 conversations/mo)',
    'Campaign analytics',
  ],
  growth: [
    'Everything in Starter',
    'Unlimited AI bot conversations',
    'Instagram inbox',
    'Priority support',
    'Advanced segments',
  ],
  scale: [
    'Everything in Growth',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantee',
    'Custom AI training',
  ],
}
