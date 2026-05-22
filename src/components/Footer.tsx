"use client";

const cols = [
  { heading: "Product",  links: ["Features","Automations","Integrations","Pricing","Changelog"] },
  { heading: "Company",  links: ["About","Blog","Contact","Careers"] },
  { heading: "Compare",  links: ["vs AiSensy","vs QuickReply","vs BotSpace","vs WATI"] },
  { heading: "Legal",    links: ["Privacy Policy","Terms","Refund Policy"] },
];

export default function Footer() {
  return (
    <footer className="section-black pt-16 pb-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <span className="font-logo text-white" style={{ fontSize: 32 }}>Tellero</span>
            <p className="body-sm mt-3 max-w-xs" style={{ color: "rgba(255,255,255,0.28)", lineHeight: 1.65 }}>
              The WhatsApp revenue engine for Indian D2C brands.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <p className="label mb-4" style={{ color: "rgba(255,255,255,0.18)" }}>{col.heading}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="body-sm transition-colors" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                      onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="body-sm" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            © 2026 Tellero · Made for Indian D2C brands 🇮🇳
          </p>
          <a href="mailto:support@tellero.in" className="body-sm" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textDecoration: "none" }}>
            support@tellero.in
          </a>
        </div>
      </div>
    </footer>
  );
}
