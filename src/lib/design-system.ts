/**
 * Tellero Design System — Dashboard tokens
 *
 * The landing page uses CSS vars (var(--cream), var(--burgundy), etc.)
 * The dashboard uses this dark-theme system (bg-[ds.bg], text-[ds.text.primary], etc.)
 *
 * Usage: import { ds } from '@/lib/design-system'
 */

export const ds = {
  // ── Backgrounds
  bg: {
    base:    '#0A0A0A',   // page background
    surface: '#111111',   // cards, sidebars
    elevated:'#1A1A1A',   // modals, dropdowns
    hover:   '#1E1E1E',   // hover state on surface
    border:  '#262626',   // subtle dividers
  },

  // ── Text
  text: {
    primary:   '#FFFFFF',
    secondary: 'rgba(255,255,255,0.55)',
    muted:     'rgba(255,255,255,0.30)',
    disabled:  'rgba(255,255,255,0.18)',
  },

  // ── Accent (WhatsApp green)
  accent: {
    DEFAULT: '#25D366',
    dim:     'rgba(37,211,102,0.12)',
    border:  'rgba(37,211,102,0.25)',
    hover:   '#1DB954',
  },

  // ── Status colours
  status: {
    success:  { bg: 'rgba(37,211,102,0.12)', text: '#25D366',  border: 'rgba(37,211,102,0.2)' },
    warning:  { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24',  border: 'rgba(251,191,36,0.2)' },
    error:    { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444',  border: 'rgba(239,68,68,0.2)'  },
    info:     { bg: 'rgba(99,102,241,0.12)', text: '#818CF8',  border: 'rgba(99,102,241,0.2)' },
    neutral:  { bg: 'rgba(255,255,255,0.06)',text: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' },
  },

  // ── Radius
  radius: {
    sm:  '8px',
    md:  '12px',
    lg:  '16px',
    xl:  '20px',
    full:'9999px',
  },

  // ── Typography scale
  font: {
    sans: 'var(--font-dm-sans), "DM Sans", system-ui, sans-serif',
    serif:'var(--font-instrument-serif), "Instrument Serif", Georgia, serif',
    mono: 'var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", monospace',
  },

  // ── Sidebar dimensions
  sidebar: {
    width:       '220px',
    collapsedW:  '64px',
  },
} as const

// Helper: broadcast status → badge variant
export const broadcastStatusMeta = {
  draft:     { label: 'Draft',     color: ds.status.neutral  },
  scheduled: { label: 'Scheduled', color: ds.status.info     },
  sending:   { label: 'Sending',   color: ds.status.warning  },
  sent:      { label: 'Sent',      color: ds.status.success  },
  failed:    { label: 'Failed',    color: ds.status.error    },
} as const

export type BroadcastStatus = keyof typeof broadcastStatusMeta
