"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { TemplatePreviewPhone } from "../TemplatePreviewPhone";
import { extractVariables, LANGUAGE_LABELS, CATEGORIES } from "../../_lib/templateHelpers";
import type { CreateTemplateState } from "../../_hooks/useCreateTemplate";
import type { HeaderType } from "../../_lib/templateHelpers";

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.08em",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ ...labelStyle, margin: 0 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-dark)", fontWeight: 500 }}>{value}</p>
    </div>
  );
}

export function StepPreview({ state }: { state: CreateTemplateState; dispatch: any }) {
  const vars = extractVariables(state.body);

  /* Sample values: use labels if set, else show placeholder */
  const [sampleValues, setSampleValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    vars.forEach(v => {
      const n = v.replace(/\D/g, "");
      init[n] = state.variableLabels[n] ? `[${state.variableLabels[n]}]` : v;
    });
    return init;
  });

  const catLabel  = CATEGORIES.find(c => c.value === state.category)?.label ?? state.category;
  const langLabel = LANGUAGE_LABELS[state.language] ?? state.language;

  const headerForPreview = state.header.enabled
    ? { type: state.header.type as HeaderType, text: state.header.text }
    : undefined;
  const footerForPreview = state.footer.enabled ? state.footer.text : undefined;
  const buttonsForPreview= state.buttons.enabled ? state.buttons.items : undefined;

  return (
    <div style={{ display: "flex", gap: 0, height: "100%", minHeight: 340 }}>

      {/* Left: summary */}
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Ready indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)",
          borderRadius: 10, padding: "10px 14px",
        }}>
          <CheckCircle2 size={16} color="#15803D" />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#15803D" }}>
            Ready to submit for review
          </p>
        </div>

        {/* Basic info */}
        <div style={{
          background: "white", border: "1.5px solid var(--border)", borderRadius: 12,
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12,
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Template details
          </p>
          <Row label="Name"     value={state.name} />
          <Row label="Category" value={catLabel}   />
          <Row label="Language" value={langLabel}  />
        </div>

        {/* Components summary */}
        <div style={{
          background: "white", border: "1.5px solid var(--border)", borderRadius: 12,
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Components
          </p>

          {state.header.enabled && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60, paddingTop: 2 }}>Header</span>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-dark)" }}>
                {state.header.type === "TEXT" ? state.header.text || "(empty)" : state.header.type}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60, paddingTop: 2 }}>Body</span>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-dark)", lineHeight: 1.5 }}>
              {state.body.slice(0, 80)}{state.body.length > 80 ? "…" : ""}
            </p>
          </div>

          {state.footer.enabled && state.footer.text && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60, paddingTop: 2 }}>Footer</span>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-dark)" }}>{state.footer.text}</p>
            </div>
          )}

          {state.buttons.enabled && state.buttons.items.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60, paddingTop: 2 }}>Buttons</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {state.buttons.items.map(btn => (
                  <p key={btn.id} style={{ margin: 0, fontSize: 13, color: "var(--text-dark)" }}>
                    &ldquo;{btn.text}&rdquo; &middot; {btn.subtype.replace("_", " ").toLowerCase()}
                    {btn.value ? ` (${btn.value})` : ""}
                  </p>
                ))}
              </div>
            </div>
          )}

          {vars.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60, paddingTop: 2 }}>Vars</span>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-dark)" }}>{vars.join(", ")}</p>
            </div>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Meta typically reviews templates within <strong>24 hours</strong>.
          You&apos;ll see the status update on the Templates page.
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "var(--border)", flexShrink: 0 }} />

      {/* Right: phone preview */}
      <div style={{
        width: 280, flexShrink: 0, background: "var(--cream)",
        padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto",
      }}>
        <p style={{ ...labelStyle, margin: 0, textAlign: "center" }}>Preview</p>
        <TemplatePreviewPhone
          header={headerForPreview}
          body={state.body}
          footer={footerForPreview}
          buttons={buttonsForPreview}
          variableValues={sampleValues}
        />

        {/* Live sample value editors */}
        {vars.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <p style={{ ...labelStyle, margin: "0 0 2px", textAlign: "center" }}>Edit preview values</p>
            {vars.map(v => {
              const n = v.replace(/\D/g, "");
              return (
                <div key={v} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    background: "rgba(56,0,8,0.08)", color: "var(--burgundy)",
                    borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{v}</span>
                  <input
                    style={{
                      flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid var(--border)",
                      fontSize: 12, background: "white", color: "var(--text-dark)", outline: "none",
                    }}
                    value={sampleValues[n] ?? ""}
                    onChange={e => setSampleValues(prev => ({ ...prev, [n]: e.target.value }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
