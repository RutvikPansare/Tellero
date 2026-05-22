"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Megaphone,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Broadcasts",   href: "/dashboard/broadcast",     icon: Megaphone,    badge: null   },
  { label: "Contacts",     href: "/dashboard/contacts",      icon: Users,        badge: null   },
  { label: "Analytics",    href: "/dashboard/analytics",     icon: BarChart2,    badge: "Soon" },
  { label: "Automations",  href: "/dashboard/automations",   icon: Zap,          badge: "Soon" },
  { label: "Conversations",href: "/dashboard/conversations", icon: MessageSquare,badge: "Soon" },
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
        background:  "var(--burgundy)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(197,232,74,0.15)", border: "1px solid rgba(197,232,74,0.25)" }}
        >
          <Megaphone size={14} style={{ color: "var(--lime)" }} />
        </div>
        <span className="font-logo text-white" style={{ fontSize: 20 }}>
          Tellero
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p
          className="px-3 mb-2"
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}
        >
          Menu
        </p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname.startsWith(href);
          const isSoon   = badge === "Soon";
          return (
            <Link
              key={href}
              href={isSoon ? "#" : href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color:      isActive ? "var(--lime)" : "rgba(255,255,255,0.55)",
                background: isActive ? "rgba(197,232,74,0.1)" : "transparent",
                opacity:    isSoon   ? 0.45 : 1,
                pointerEvents: isSoon ? "none" : "auto",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                if (!isActive && !isSoon) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive && !isSoon) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)",
                    padding: "2px 6px", borderRadius: 99,
                  }}
                >
                  {badge}
                </span>
              )}
              {isActive && !isSoon && (
                <ChevronRight size={12} style={{ color: "var(--lime)", opacity: 0.8 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-3 pb-5 flex flex-col gap-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}
      >
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        >
          <Settings size={15} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left"
          style={{ color: "rgba(255,180,180,0.6)", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,100,100,0.08)"; e.currentTarget.style.color = "rgba(255,180,180,0.9)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,180,180,0.6)"; }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
