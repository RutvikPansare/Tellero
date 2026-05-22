"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        borderBottom: "1px solid #1E1E1E",
        background: "#0A0A0A",
        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
      }}
    >
      {/* Left: title */}
      <div>
        <h1
          className="text-white font-semibold"
          style={{ fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: actions + icons */}
      <div className="flex items-center gap-3">
        {actions}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.35)", background: "transparent" }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#1A1A1A";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
          }}
        >
          <Search size={16} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.35)", background: "transparent" }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#1A1A1A";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
          }}
        >
          <Bell size={16} />
        </button>
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "rgba(37,211,102,0.15)", color: "#25D366", border: "1px solid rgba(37,211,102,0.25)" }}
        >
          T
        </div>
      </div>
    </header>
  );
}
