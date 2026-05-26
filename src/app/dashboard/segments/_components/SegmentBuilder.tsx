"use client";

import { Plus } from "lucide-react";
import { FilterRow } from "./FilterRow";
import type { FilterCondition } from "@/types/segments";
import type { Tag } from "@/types/segments";

interface Props {
  name:         string;
  description:  string;
  filters:      FilterCondition[];
  conjunction:  "AND" | "OR";
  errors:       Record<string, string>;
  allTags:      Tag[];
  onSetName:    (v: string) => void;
  onSetDesc:    (v: string) => void;
  onSetConj:    (v: "AND" | "OR") => void;
  onAddFilter:  () => void;
  onUpdateFilter:(id: string, changes: Partial<FilterCondition>) => void;
  onRemoveFilter:(id: string) => void;
}

const inputStyle: React.CSSProperties = {
  padding:     "10px 14px",
  borderRadius:"var(--radius-btn)",
  border:      "1.5px solid var(--border)",
  background:  "white",
  fontSize:    14,
  color:       "var(--text-dark)",
  outline:     "none",
  width:       "100%",
  transition:  "border-color 0.2s",
  fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
};

export function SegmentBuilder({
  name, description, filters, conjunction, errors, allTags,
  onSetName, onSetDesc, onSetConj, onAddFilter, onUpdateFilter, onRemoveFilter,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dark)" }}>
          Segment name <span style={{ color: "#DC2626" }}>*</span>
        </label>
        <input
          style={{ ...inputStyle, borderColor: errors.name ? "#DC2626" : "var(--border)" }}
          placeholder="e.g. VIP buyers, High-value churned"
          value={name}
          maxLength={80}
          onChange={e => onSetName(e.target.value)}
          onFocus={e  => (e.currentTarget.style.borderColor = errors.name ? "#DC2626" : "var(--text-dark)")}
          onBlur={e   => (e.currentTarget.style.borderColor = errors.name ? "#DC2626" : "var(--border)")}
        />
        {errors.name && <p style={{ margin: 0, fontSize: 12, color: "#DC2626" }}>{errors.name}</p>}
      </div>

      {/* Description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dark)" }}>
          Description <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>optional</span>
        </label>
        <input
          style={inputStyle}
          placeholder="What is this segment for?"
          value={description}
          onChange={e => onSetDesc(e.target.value)}
          onFocus={e  => (e.currentTarget.style.borderColor = "var(--text-dark)")}
          onBlur={e   => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Filters section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header row with conjunction toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dark)" }}>
            Contacts match
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {(["AND", "OR"] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onSetConj(c)}
                style={{
                  padding:      "4px 12px",
                  borderRadius: 99,
                  fontSize:     11,
                  fontWeight:   700,
                  cursor:       "pointer",
                  border:       `1.5px solid ${conjunction === c ? "var(--text-dark)" : "var(--border)"}`,
                  background:   conjunction === c ? "var(--text-dark)" : "white",
                  color:        conjunction === c ? "white" : "var(--text-muted)",
                  transition:   "all 0.15s",
                }}
              >
                {c === "AND" ? "All of these" : "Any of these"}
              </button>
            ))}
          </div>
        </div>

        {/* Filter rows */}
        {filters.length === 0 && (
          <div style={{
            padding:     "24px",
            borderRadius: 10,
            border:      "1.5px dashed var(--border)",
            textAlign:   "center",
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              No filters yet — add one below
            </p>
          </div>
        )}

        {filters.map((f, i) => (
          <FilterRow
            key={f.id}
            filter={f}
            index={i}
            allTags={allTags}
            conjunction={conjunction}
            showLabel={filters.length > 1}
            onUpdate={onUpdateFilter}
            onRemove={onRemoveFilter}
          />
        ))}

        {errors.filters && (
          <p style={{ margin: 0, fontSize: 12, color: "#DC2626" }}>{errors.filters}</p>
        )}

        {/* Add filter button */}
        <button
          type="button"
          onClick={onAddFilter}
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         6,
            padding:     "8px 14px",
            borderRadius: 8,
            border:      "1.5px dashed var(--border)",
            background:  "transparent",
            fontSize:    13,
            fontWeight:  600,
            color:       "var(--text-muted)",
            cursor:      "pointer",
            transition:  "border-color 0.15s, color 0.15s",
            alignSelf:   "flex-start",
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = "var(--burgundy)";
            e.currentTarget.style.color = "var(--burgundy)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Plus size={13} /> Add filter
        </button>
      </div>
    </div>
  );
}
