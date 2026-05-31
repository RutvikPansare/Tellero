"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const features = [
  { label: "Lead Capture",           tellero: true, instagramDMs: false, googleSheets: false, whatsappBiz: false, genericCRM: true  },
  { label: "Auto DM",                tellero: true, instagramDMs: false, googleSheets: false, whatsappBiz: false, genericCRM: false },
  { label: "Pipeline Tracking",      tellero: true, instagramDMs: false, googleSheets: "Manual", whatsappBiz: false, genericCRM: true  },
  { label: "WhatsApp Integration",   tellero: true, instagramDMs: false, googleSheets: false, whatsappBiz: true,  genericCRM: false },
  { label: "Follow-up Automation",   tellero: true, instagramDMs: false, googleSheets: false, whatsappBiz: false, genericCRM: "Limited" },
  { label: "Broadcasting",           tellero: true, instagramDMs: false, googleSheets: false, whatsappBiz: true,  genericCRM: false },
  { label: "Analytics",              tellero: true, instagramDMs: "Basic", googleSheets: false, whatsappBiz: "Basic", genericCRM: true  },
];

type CellValue = string | boolean;

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true)
    return (
      <span style={{ color: "#25D366", fontWeight: 700, fontSize: 16 }}>✓</span>
    );
  if (value === false)
    return (
      <span style={{ color: "#E03838", fontWeight: 700, fontSize: 16, opacity: 0.6 }}>✕</span>
    );
  return (
    <span
      className="body-sm font-semibold"
      style={{ color: highlight ? "var(--text-dark)" : "var(--text-muted)" }}
    >
      {value}
    </span>
  );
}

export default function CreatorsComparison() {
  return (
    <section className="section-cream py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="label mb-4">Compare</p>
          <h2 className="heading-xl text-[var(--text-dark)] max-w-xl">
            Stop Managing Leads Across 5 Different Tools
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  className="px-5 py-4 body-sm font-medium"
                  style={{ background: "#FAFAF8", color: "var(--text-muted)", width: 170 }}
                >
                  Feature
                </th>
                <th
                  className="px-5 py-4 text-center"
                  style={{
                    background: "#F4FEF8",
                    borderLeft: "1px solid rgba(37,211,102,0.15)",
                    borderRight: "1px solid rgba(37,211,102,0.15)",
                  }}
                >
                  <span className="heading-sm" style={{ color: "var(--text-dark)" }}>
                    Tellero
                  </span>
                  <span
                    className="ml-2 px-2 py-0.5 text-white text-[10px] font-bold uppercase tracking-wide rounded-full"
                    style={{ background: "var(--text-dark)" }}
                  >
                    All-in-one
                  </span>
                </th>
                {["Instagram DMs", "Google Sheets", "WhatsApp Biz", "Generic CRM"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-4 body-sm font-medium text-center"
                      style={{ background: "#FAFAF8", color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: "1px solid rgba(26,20,17,0.05)",
                    background: i % 2 === 0 ? "white" : "#FDFAF6",
                  }}
                >
                  <td
                    className="px-5 py-4 body-sm"
                    style={{ color: "var(--text-mid)" }}
                  >
                    {row.label}
                  </td>
                  <td
                    className="px-5 py-4 text-center"
                    style={{
                      background: "rgba(244,254,248,0.6)",
                      borderLeft: "1px solid rgba(37,211,102,0.1)",
                      borderRight: "1px solid rgba(37,211,102,0.1)",
                    }}
                  >
                    <Cell value={row.tellero} highlight />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Cell value={row.instagramDMs} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Cell value={row.googleSheets} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Cell value={row.whatsappBiz} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Cell value={row.genericCRM} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
