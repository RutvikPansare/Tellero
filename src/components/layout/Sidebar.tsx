"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Megaphone, Users, BarChart2, Settings,
  LogOut, Zap, MessageSquare, ChevronRight, LayoutTemplate, Target,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Broadcasts",    href: "/dashboard/broadcast",     icon: Megaphone,       badge: null   },
  { label: "Templates",     href: "/dashboard/templates",     icon: LayoutTemplate,  badge: null   },
  { label: "Contacts",      href: "/dashboard/contacts",      icon: Users,           badge: null   },
  { label: "Segments",      href: "/dashboard/segments",      icon: Target,          badge: null   },
  { label: "Analytics",     href: "/dashboard/analytics",     icon: BarChart2,       badge: "Soon" },
  { label: "Automations",   href: "/dashboard/automations",   icon: Zap,             badge: null   },
  { label: "Inbox",         href: "/dashboard/inbox",         icon: MessageSquare,   badge: null   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
              style={{
                color:          isActive ? "var(--burgundy)" : "var(--text-mid)",
                background:     isActive ? "rgba(56,0,8,0.07)" : "transparent",
                border:         isActive ? "1px solid rgba(56,0,8,0.12)" : "1px solid transparent",
                opacity:        isSoon ? 0.45 : 1,
                pointerEvents:  isSoon ? "none" : "auto",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                if (!isActive && !isSoon) {
                  e.currentTarget.style.background = "var(--cream-3)";
                  e.currentTarget.style.color = "var(--text-dark)";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive && !isSoon) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-mid)";
                }
              }}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", background: "var(--cream-3)",
                  color: "var(--text-muted)", padding: "2px 6px",
                  borderRadius: 99, border: "1px solid var(--border)",
                }}>
                  {badge}
                </span>
              )}
              {isActive && !isSoon && (
                <ChevronRight size={12} style={{ color: "var(--burgundy)", opacity: 0.5 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-3 pb-5 flex flex-col gap-0.5"
        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
      >
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "var(--text-mid)", textDecoration: "none" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; }}
        >
          <Settings size={15} />
          Settings
        </Link>
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
