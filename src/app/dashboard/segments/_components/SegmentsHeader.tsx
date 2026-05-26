import { Plus } from "lucide-react";
import type { Segment } from "@/types/segments";

interface Props {
  segments: Segment[];
  onNew:    () => void;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)", borderRadius: 12,
      padding: "12px 16px", display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 110,
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-dark)" }}>{value}</p>
    </div>
  );
}

export function SegmentsHeader({ segments, onNew }: Props) {
  const totalContacts = segments.reduce((sum, s) => sum + s.contact_count, 0);
  const andSegments   = segments.filter(s => s.conjunction === "AND").length;
  const orSegments    = segments.filter(s => s.conjunction === "OR").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-dark)" }}>
            Segments
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            Dynamic audiences built from filter conditions
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            border: "none", background: "var(--text-dark)", color: "white", cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseOver={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseOut={e =>(e.currentTarget.style.opacity="1")}>
          <Plus size={14} /> New segment
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total segments"   value={segments.length} />
        <StatCard label="Contacts covered" value={totalContacts.toLocaleString("en-IN")} />
        <StatCard label="AND segments"     value={andSegments} />
        <StatCard label="OR segments"      value={orSegments} />
      </div>
    </div>
  );
}
