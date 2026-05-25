import { Tag, Upload, Loader2 } from "lucide-react";
import type { ContactWithTags } from "@/types/segments";

interface Props {
  contacts:      ContactWithTags[];
  totalCount:    number;
  importing?:    boolean;
  onManageTags:  () => void;
  onImport:      () => void;
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)", borderRadius: 12,
      padding: "12px 16px", display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 110,
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: accent ?? "var(--text-dark)" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

export function ContactsHeader({ contacts, totalCount, importing, onManageTags, onImport }: Props) {
  const tagged        = contacts.filter(c => c.contact_tags.length > 0).length;
  const taggedPct     = totalCount > 0 ? Math.round(tagged / totalCount * 100) : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const active30      = contacts.filter(c => c.last_order_at && c.last_order_at >= thirtyDaysAgo).length;
  const highValue     = contacts.filter(c => c.total_spent > 5000).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-dark)" }}>Contacts</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            Manage your customer list and audience tags
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onManageTags}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: "1.5px solid var(--border)", background: "white",
              color: "var(--text-mid)", cursor: "pointer", transition: "border-color 0.15s",
            }}
            onMouseOver={e=>(e.currentTarget.style.borderColor="var(--text-dark)")}
            onMouseOut={e =>(e.currentTarget.style.borderColor="var(--border)")}>
            <Tag size={13} /> Manage tags
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={importing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "none", background: "var(--text-dark)", color: "white",
              cursor: importing ? "not-allowed" : "pointer",
              opacity: importing ? 0.7 : 1,
            }}
            onMouseOver={e=>{ if (!importing) e.currentTarget.style.opacity="0.85"; }}
            onMouseOut={e =>{ if (!importing) e.currentTarget.style.opacity="1"; }}>
            {importing
              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Importing…</>
              : <><Upload size={13} /> Import CSV</>
            }
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total"          value={totalCount.toLocaleString("en-IN")} />
        <StatCard label="Tagged"         value={`${taggedPct}%`}    sub={`${tagged} contacts`} accent="#15803D" />
        <StatCard label="Active 30 days" value={active30}           sub="placed an order"       accent="#15803D" />
        <StatCard label="High value"     value={highValue}          sub="spend > ₹5,000"        accent="var(--burgundy)" />
      </div>
    </div>
  );
}
