"use client";

import { X } from "lucide-react";
import { TagBadge } from "@/components/shared/TagBadge";
import { FILTER_FIELDS, OPERATORS_BY_TYPE } from "../_lib/filterOperators";
import type { FilterCondition, FilterField, FilterOperator, Tag } from "@/types/segments";

const inputStyle: React.CSSProperties = {
  padding:      "7px 10px",
  borderRadius: 8,
  border:       "1.5px solid var(--border)",
  background:   "white",
  fontSize:     13,
  color:        "var(--text-dark)",
  outline:      "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  cursor:     "pointer",
  paddingRight: 28,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E")`,
  backgroundRepeat:   "no-repeat",
  backgroundPosition: "calc(100% - 10px) center",
};

interface Props {
  filter:     FilterCondition;
  index:      number;
  allTags:    Tag[];
  conjunction:"AND" | "OR";
  showLabel:  boolean;
  onUpdate:   (id: string, changes: Partial<FilterCondition>) => void;
  onRemove:   (id: string) => void;
}

export function FilterRow({ filter, index, allTags, conjunction, showLabel, onUpdate, onRemove }: Props) {
  /* Derive current field definition */
  const allFields = FILTER_FIELDS.flatMap(g => g.fields);
  const fieldDef  = allFields.find(f => f.value === filter.field);
  const valueType = fieldDef?.valueType ?? "number";

  const operators = OPERATORS_BY_TYPE[valueType as keyof typeof OPERATORS_BY_TYPE] ?? [];

  function handleFieldChange(field: FilterField) {
    /* Reset operator + value when field type changes */
    const newDef = allFields.find(f => f.value === field);
    const newType = newDef?.valueType ?? "number";
    const newOps  = OPERATORS_BY_TYPE[newType as keyof typeof OPERATORS_BY_TYPE] ?? [];
    onUpdate(filter.id, {
      field,
      operator: (newOps[0]?.value ?? "equals") as FilterOperator,
      value:    null,
    });
  }

  /* Value input changes based on field type */
  function renderValueInput() {
    switch (valueType) {
      case "tag":
        return (
          <div style={{ flex: 1, position: "relative" }}>
            <select
              style={{ ...selectStyle, width: "100%" }}
              value={(filter.value as string) ?? ""}
              onChange={e => onUpdate(filter.id, { value: e.target.value || null })}
            >
              <option value="">Select tag…</option>
              {allTags.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            min={0}
            style={{ ...inputStyle, width: 100 }}
            placeholder="0"
            value={(filter.value as number) ?? ""}
            onChange={e => onUpdate(filter.id, { value: e.target.valueAsNumber || 0 })}
          />
        );

      case "currency":
        return (
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 10, fontSize: 12, color: "var(--text-muted)", pointerEvents: "none" }}>₹</span>
            <input
              type="number"
              min={0}
              style={{ ...inputStyle, paddingLeft: 22, width: 110 }}
              placeholder="0"
              value={(filter.value as number) ?? ""}
              onChange={e => onUpdate(filter.id, { value: e.target.valueAsNumber || 0 })}
            />
          </div>
        );

      case "date": {
        const isRelative = filter.operator === "within_days" || filter.operator === "more_than_days_ago";
        if (isRelative) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                min={1}
                style={{ ...inputStyle, width: 70 }}
                placeholder="30"
                value={(filter.value as number) ?? ""}
                onChange={e => onUpdate(filter.id, { value: e.target.valueAsNumber || null })}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>days</span>
            </div>
          );
        }
        return (
          <input
            type="date"
            style={{ ...inputStyle, width: 150 }}
            value={(filter.value as string) ?? ""}
            onChange={e => onUpdate(filter.id, { value: e.target.value || null })}
          />
        );
      }

      case "attribute":
        return (
          <div style={{ display: "flex", gap: 6, flex: 1 }}>
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 80 }}
              placeholder="attribute key"
              value={((filter.value as string[]) ?? [])[0] ?? ""}
              onChange={e => {
                const pair = (filter.value as string[]) ?? ["", ""];
                onUpdate(filter.id, { value: [e.target.value, pair[1] ?? ""] });
              }}
            />
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 80 }}
              placeholder="value"
              value={((filter.value as string[]) ?? [])[1] ?? ""}
              onChange={e => {
                const pair = (filter.value as string[]) ?? ["", ""];
                onUpdate(filter.id, { value: [pair[0] ?? "", e.target.value] });
              }}
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Conjunction label between rows */}
      {showLabel && index > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--text-muted)",
            padding: "2px 8px", background: "var(--cream-2)",
            borderRadius: 99, border: "1px solid var(--border)",
          }}>
            {conjunction}
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
      )}

      {/* Filter row */}
      <div style={{
        display:     "flex",
        alignItems:  "center",
        gap:         8,
        padding:     "10px 12px",
        background:  "white",
        border:      "1.5px solid var(--border)",
        borderRadius: 10,
        flexWrap:    "wrap",
      }}>
        {/* Field selector */}
        <select
          style={{ ...selectStyle, minWidth: 160 }}
          value={filter.field}
          onChange={e => handleFieldChange(e.target.value as FilterField)}
        >
          {FILTER_FIELDS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.fields.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Operator selector */}
        <select
          style={{ ...selectStyle, minWidth: 120 }}
          value={filter.operator}
          onChange={e => onUpdate(filter.id, {
            operator: e.target.value as FilterOperator,
            value:    null,
          })}
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {/* Value input */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {renderValueInput()}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(filter.id)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 6, borderRadius: 6, color: "var(--text-muted)",
            display: "flex", alignItems: "center", flexShrink: 0,
          }}
          onMouseOver={e => (e.currentTarget.style.color = "#DC2626")}
          onMouseOut={e  => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
