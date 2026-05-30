import { SegmentCard } from "./SegmentCard";
import type { Segment } from "@/types/segments";

interface Props {
  segments: Segment[];
  loading:  boolean;
  onEdit:   (seg: Segment) => void;
  onDelete: (id: string) => void;
  onNew:    () => void;
  onClick:  (seg: Segment) => void;
}

function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 300px))", gap: 16, alignItems: "start" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 160, borderRadius: 14, background: "white",
          border: "1px solid var(--border)", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)",
            animation: "shimmer 1.4s infinite",
          }} />
        </div>
      ))}
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: "rgba(56,0,8,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 26,
      }}>
        🎯
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
        No segments yet
      </p>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text-muted)" }}>
        Create dynamic audiences to target the right customers
      </p>
      <button
        onClick={onNew}
        style={{
          padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: "var(--text-dark)", color: "white", border: "none", cursor: "pointer",
        }}
        onMouseOver={e=>(e.currentTarget.style.opacity="0.85")}
        onMouseOut={e =>(e.currentTarget.style.opacity="1")}>
        Create first segment
      </button>
    </div>
  );
}

export function SegmentList({ segments, loading, onEdit, onDelete, onNew, onClick }: Props) {
  if (loading) return <Skeleton />;
  if (segments.length === 0) return <EmptyState onNew={onNew} />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 300px))", gap: 16, alignItems: "start" }}>
      {segments.map(s => (
        <SegmentCard
          key={s.id}
          segment={s}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
