"use client";

import Header from "@/components/layout/Header";
import { Users, Upload } from "lucide-react";

export default function ContactsPage() {
  return (
    <>
      <Header
        title="Contacts"
        subtitle="Your WhatsApp opted-in customer list"
        actions={
          <button className="dash-btn-secondary">
            <Upload size={14} />
            Import CSV
          </button>
        }
      />
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-5"
        style={{ background: "#0A0A0A" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)" }}
        >
          <Users size={26} style={{ color: "#818CF8" }} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold" style={{ fontSize: 18 }}>Contacts coming soon</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 6, maxWidth: 360, lineHeight: 1.6 }}>
            Connect your Shopify store or import a CSV to sync your WhatsApp opted-in customers.
          </p>
        </div>
        <button className="dash-btn-primary" style={{ background: "#818CF8" }}>
          Connect Shopify
        </button>
      </div>
    </>
  );
}
