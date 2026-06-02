"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { PLAN_DISPLAY } from "@/lib/planLimits";
import {
  Megaphone, Users, BarChart2, Settings,
  LogOut, Zap, MessageSquare, ChevronRight, LayoutTemplate, Target, CreditCard,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Broadcasts",  href: "/dashboard/broadcast",   icon: Megaphone,      badge: null   },
  { label: "Templates",   href: "/dashboard/templates",   icon: LayoutTemplate, badge: null   },
  { label: "Contacts",    href: "/dashboard/contacts",    icon: Users,          badge: null   },
  { label: "Segments",    href: "/dashboard/segments",    icon: Target,         badge: null   },
  { label: "Inbox",       href: "/dashboard/inbox",       icon: MessageSquare,  badge: null   },
];

const AUTOMATION_ITEMS = [
  { label: "COD Confirmation",    href: "/dashboard/automations/cod" },
  { label: "Abandoned Cart",      href: "/dashboard/automations/abandoned-cart" },
  { label: "Order Notifications", href: "/dashboard/automations/order-notifications" },
  { label: "Reorder Reminders",   href: "/dashboard/automations/reorder" },
];

const ANALYTICS_ITEMS = [
  { label: "Campaigns",   href: "/dashboard/analytics/campaigns" },
  { label: "Automations", href: "/dashboard/analytics/automations" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const { plan, isPaid } = usePlan();
  const planDisplay = PLAN_DISPLAY[plan];
  const onAutomations = pathname.startsWith("/dashboard/automations");
  const onAnalytics   = pathname.startsWith("/dashboard/analytics");
  const onSettings    = pathname.startsWith("/dashboard/settings");

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const linkStyle = (active: boolean, soon = false) => ({
    color:          active ? "var(--burgundy)" : "var(--text-mid)",
    background:     active ? "rgba(56,0,8,0.07)" : "transparent",
    border:         active ? "1px solid rgba(56,0,8,0.12)" : "1px solid transparent",
    opacity:        soon ? 0.45 : 1,
    pointerEvents:  soon ? "none" as const : "auto" as const,
    textDecoration: "none",
  });

  return (
    <aside
      className="flex flex-col h-screen w-[220px] flex-shrink-0"
      style={{
        background:  "var(--cream-2)",
        borderRight: "1px solid var(--border)",
        fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(56,0,8,0.08)", border: "1px solid rgba(56,0,8,0.15)" }}
        >
          <Megaphone size={14} style={{ color: "var(--burgundy)" }} />
        </div>
        <span className="font-logo" style={{ fontSize: 20, color: "var(--text-dark)" }}>
          Tellero
        </span>
        <Link
          href="/dashboard/settings/billing"
          style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            padding: "2px 7px", borderRadius: 99, textDecoration: "none",
            background: isPaid ? "rgba(37,211,102,0.12)" : "var(--cream-3)",
            color: isPaid ? "#16A34A" : "var(--text-muted)",
            border: isPaid ? "1px solid rgba(37,211,102,0.3)" : "1px solid var(--border)",
          }}
        >
          {isPaid ? `${planDisplay.label.replace(' Plan', '')} ✓` : "Free ↑"}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="label px-3 mb-2">Menu</p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname.startsWith(href);
          const isSoon   = badge === "Soon";
          return (
            <Link
              key={href}
              href={isSoon ? "#" : href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={linkStyle(isActive, isSoon)}
              onMouseOver={(e) => { if (!isActive && !isSoon) { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; } }}
              onMouseOut={(e)  => { if (!isActive && !isSoon) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; } }}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--cream-3)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: 99, border: "1px solid var(--border)" }}>
                  {badge}
                </span>
              )}
              {isActive && !isSoon && <ChevronRight size={12} style={{ color: "var(--burgundy)", opacity: 0.5 }} />}
            </Link>
          );
        })}

        {/* Automations group with sub-nav */}
        <Link
          href="/dashboard/automations/cod"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={linkStyle(onAutomations)}
          onMouseOver={(e) => { if (!onAutomations) { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; } }}
          onMouseOut={(e)  => { if (!onAutomations) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; } }}
        >
          <Zap size={15} />
          <span className="flex-1">Automations</span>
          {onAutomations && <ChevronRight size={12} style={{ color: "var(--burgundy)", opacity: 0.5 }} />}
        </Link>

        {/* Sub-items — always visible so users can jump between automations */}
        <div className="flex flex-col gap-0.5 ml-4 pl-3" style={{ borderLeft: "2px solid var(--border)" }}>
          {AUTOMATION_ITEMS.map(({ label, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color:  isActive ? "var(--burgundy)" : "var(--text-muted)",
                  background: isActive ? "rgba(56,0,8,0.05)" : "transparent",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--text-dark)"; e.currentTarget.style.background = "var(--cream-3)"; } }}
                onMouseOut={(e)  => { if (!isActive) { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; } }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Analytics group with sub-nav */}
        <Link
          href="/dashboard/analytics/campaigns"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={linkStyle(onAnalytics)}
          onMouseOver={(e) => { if (!onAnalytics) { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; } }}
          onMouseOut={(e)  => { if (!onAnalytics) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; } }}
        >
          <BarChart2 size={15} />
          <span className="flex-1">Analytics</span>
          {onAnalytics && <ChevronRight size={12} style={{ color: "var(--burgundy)", opacity: 0.5 }} />}
        </Link>

        <div className="flex flex-col gap-0.5 ml-4 pl-3" style={{ borderLeft: "2px solid var(--border)" }}>
          {ANALYTICS_ITEMS.map(({ label, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color:  isActive ? "var(--burgundy)" : "var(--text-muted)",
                  background: isActive ? "rgba(56,0,8,0.05)" : "transparent",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--text-dark)"; e.currentTarget.style.background = "var(--cream-3)"; } }}
                onMouseOut={(e)  => { if (!isActive) { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; } }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div
        className="px-3 pb-5 flex flex-col gap-0.5"
        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
      >
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={linkStyle(onSettings)}
          onMouseOver={(e) => { if (!onSettings) { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; } }}
          onMouseOut={(e)  => { if (!onSettings) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; } }}
        >
          <Settings size={15} />
          <span className="flex-1">Settings</span>
          {onSettings && <ChevronRight size={12} style={{ color: "var(--burgundy)", opacity: 0.5 }} />}
        </Link>

        <div className="flex flex-col gap-0.5 ml-4 pl-3" style={{ borderLeft: "2px solid var(--border)" }}>
            <Link
              href="/dashboard/settings/billing"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all"
              style={{
                fontSize: 13,
                fontWeight: pathname.includes("/billing") ? 600 : 400,
                color: pathname.includes("/billing") ? "var(--burgundy)" : "var(--text-muted)",
                background: pathname.includes("/billing") ? "rgba(56,0,8,0.05)" : "transparent",
                textDecoration: "none",
              }}
            >
              <CreditCard size={12} />
              Billing
            </Link>
            <Link
              href="/dashboard/settings/shopify"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all"
              style={{
                fontSize: 13,
                fontWeight: pathname.includes("/shopify") ? 600 : 400,
                color: pathname.includes("/shopify") ? "var(--burgundy)" : "var(--text-muted)",
                background: pathname.includes("/shopify") ? "rgba(56,0,8,0.05)" : "transparent",
                textDecoration: "none",
              }}
            >
              Integrations
            </Link>
            <Link
              href="/dashboard/settings/whatsapp"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all"
              style={{
                fontSize: 13,
                fontWeight: pathname.includes("/whatsapp") ? 600 : 400,
                color: pathname.includes("/whatsapp") ? "var(--burgundy)" : "var(--text-muted)",
                background: pathname.includes("/whatsapp") ? "rgba(56,0,8,0.05)" : "transparent",
                textDecoration: "none",
              }}
            >
              WhatsApp
            </Link>
          </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left"
          style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "#DC2626"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
