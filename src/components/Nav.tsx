"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-scrolled" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-logo" style={{ fontSize: 32, color: "var(--text-dark)", textDecoration: "none" }}>
          Tellero
        </a>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {[["Product","#features"],["Pricing","#pricing"],["Compare","#compare"],["Reports","#reports"],["Blog","#"]].map(([label, href]) => (
            <li key={label}>
              <a href={href} className="body-sm font-medium hover:opacity-100 transition-opacity" style={{ color: "var(--text-mid)", opacity: 0.9, textDecoration: "none" }}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a href="#" className="btn btn-outline hidden sm:inline-flex" style={{ padding: "10px 20px", fontSize: 13 }}>
            Login
          </a>
          <a href="#" className="btn btn-dark" style={{ padding: "10px 20px", fontSize: 13 }}>
            Start for free
          </a>
        </div>
      </div>
    </nav>
  );
}
