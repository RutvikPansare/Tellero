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
          <button className="btn btn-outline" style={{ padding:"9px 18px", fontSize:13, display:"inline-flex", alignItems:"center", gap:6 }}>
            <Upload size={14} /> Import CSV
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-5"
        style={{ background:"var(--cream)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background:"rgba(56,0,8,0.06)", border:"1px solid rgba(56,0,8,0.1)" }}>
          <Users size={26} style={{ color:"var(--burgundy)" }} />
        </div>
        <div className="text-center">
          <p className="heading-sm" style={{ color:"var(--text-dark)" }}>Contacts coming soon</p>
          <p className="body-md" style={{ marginTop:6, maxWidth:360 }}>
            Connect your Shopify store or import a CSV to sync your WhatsApp opted-in customers.
          </p>
        </div>
        <button className="btn btn-dark">Connect Shopify</button>
      </div>
    </>
  );
}
