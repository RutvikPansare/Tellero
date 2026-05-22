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
  {
    label: "Broadcasts",
    href: "/dashboard/broadcast",
    icon: Megaphone,
    badge: null,
  },
  {
    label: "Contacts",
    href: "/dashboard/contacts",
    icon: Users,
    badge: null,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart2,
    badge: "Soon",
  },
  {
    label: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
    badge: "Soon",
  },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
    badge: "Soon",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="flex flex-col h-screen w-[220px] flex-shrink-0 border-r"
      style={{
        background: "#111111",
        borderColor: "#1E1E1E",
        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2" style={{ borderBottom: "1px solid #1E1E1E" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.25)" }}
        >
          <Megaphone size={14} style={{ color: "#25D366" }} />
        </div>
        <span
          className="font-logo text-white"
          style={{ fontSize: 20, letterSpacing: "-0.02em" }}
        >
          Tellero
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="dash-label px-3 mb-2">Menu</p>
        {NAV_ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname.startsWith(href);
          const isSoon = badge === "Soon";
          return (
            <Link
              key={href}
              href={isSoon ? "#" : href}
              className={`dash-nav-item ${isActive ? "active" : ""}`}
              style={isSoon ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  className="dash-badge"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 10,
                    padding: "2px 7px",
                  }}
                >
                  {badge}
                </span>
              )}
              {isActive && !isSoon && (
                <ChevronRight size={13} style={{ color: "#25D366", opacity: 0.7 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 flex flex-col gap-0.5" style={{ borderTop: "1px solid #1E1E1E", paddingTop: 12 }}>
        <Link
          href="/dashboard/settings"
          className={`dash-nav-item ${pathname.startsWith("/dashboard/settings") ? "active" : ""}`}
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="dash-nav-item w-full text-left"
          style={{ color: "rgba(239,68,68,0.65)" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
