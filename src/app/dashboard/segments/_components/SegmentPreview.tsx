import { Loader2, Users } from "lucide-react";
import { TagBadge } from "@/components/shared/TagBadge";
import type { SampleContact } from "@/types/segments";

interface Props {
  count:          number;
  sampleContacts: SampleContact[];
  estimatedCost:  number;
  loading:        boolean;
}

function InitialAvatar({ name }: { name: string | null }) {
  const letter = (name ?? "?")[0]?.toUpperCase() ?? "?";
  const colors  = ["#25D366","#3B82F6","#F59E0B","#8B5CF6","#EC4899","#14B8A6"];
  const color   = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

export function SegmentPreview({ count, sampleContacts, estimatedCost, loading }: Props) {
  return (
    <div style={{
      background: "white", border: "1.5px solid var(--border)", borderRadius: 14,
      padding: "20px", display: "flex", flexDirection: "column", gap: 16,
    }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
        Preview
      </p>

      {/* Count */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Loader2 size={18} style={{ color: "var(--text-muted)", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Calculating…</span>
          </div>
        ) : count === 0 && sampleContacts.length === 0 ? (
          <div>
            <Users size={32} style={{ color: "var(--border)", margin: "0 auto 8px", display: "block" }} />
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              No contacts match — try loosening your filters
            </p>
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 40, fontWeight: 800, color: count > 0 ? "#15803D" : "var(--text-muted)", lineHeight: 1 }}>
              {count.toLocaleString("en-IN")}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              contacts match your filters
            </p>
          </>
        )}
      </div>

      {/* Sample contacts */}
      {sampleContacts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sample
          </p>
          {sampleContacts.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <InitialAvatar name={c.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.name ?? c.phone}
                </p>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 2 }}>
                  {c.contact_tags?.slice(0, 2).map(ct => (
                    <TagBadge key={ct.tag.id} name={ct.tag.name} color={ct.tag.color} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estimated cost */}
      {count > 0 && (
        <div style={{
          background: "var(--cream)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "10px 14px",
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Estimated cost for 1 broadcast</p>
          <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
            ₹{estimatedCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--text-muted)" }}>
            @ ₹0.89 per message
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
