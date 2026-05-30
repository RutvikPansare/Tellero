"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title:    string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        background:   "var(--cream)",
        fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}
    >
      {/* Left: title */}
      <div>
        <h1
          className="font-semibold"
          style={{ fontSize: 17, color: "var(--text-dark)", letterSpacing: "-0.01em", lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {actions}
        {[Search, Bell].map((Icon, i) => (
          <button
            key={i}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "var(--cream)"; e.currentTarget.style.color = "var(--text-dark)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <Icon size={16} />
          </button>
        ))}
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "var(--cream-2)", color: "var(--burgundy)", border: "1px solid var(--border)", fontSize: 13 }}
        >
          T
        </div>
      </div>
    </header>
  );
}
