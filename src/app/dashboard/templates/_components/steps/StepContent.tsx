"use client";

import { useRef, useEffect, useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import { insertAtCursor, nextVariableIndex, extractVariables } from "../../_lib/templateHelpers";
import type { CreateTemplateState } from "../../_hooks/useCreateTemplate";
import type { ButtonItem } from "../../_lib/templateHelpers";

/* ─── Shared styles ─────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  padding: "10px 14px", borderRadius: "var(--radius-btn)",
  border: "1.5px solid var(--border)", background: "white",
  fontSize: 13, color: "var(--text-dark)", outline: "none",
  width: "100%", transition: "border-color 0.2s",
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text-dark)",
  textTransform: "uppercase", letterSpacing: "0.08em",
};

const sectionStyle: React.CSSProperties = {
  border: "1.5px solid var(--border)", borderRadius: 12,
  background: "white",
};

/* ─── Toggle row ────────────────────────────────────────── */
function SectionToggle({
  label, hint, enabled, onToggle,
}: { label: string; hint: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px", cursor: "pointer",
        background: enabled ? "rgba(56,0,8,0.03)" : "white",
        borderRadius: enabled ? "10px 10px 0 0" : 10,
      }}
      onClick={onToggle}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{hint}</p>
      </div>
      {/* Toggle pill */}
      <div style={{
        width: 38, height: 22, borderRadius: 11, position: "relative",
        background: enabled ? "var(--burgundy)" : "var(--border)",
        transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: enabled ? 19 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "white",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>
    </div>
  );
}

/* ─── Variable insertion button ─────────────────────────── */
function InsertVarButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "5px 11px", borderRadius: 6, border: "1.5px solid var(--border)",
        background: "var(--cream)", fontSize: 11, fontWeight: 600,
        color: "var(--text-dark)", cursor: "pointer", fontFamily: "monospace",
        transition: "border-color 0.15s",
      }}
      onMouseOver={e => (e.currentTarget.style.borderColor = "var(--burgundy)")}
      onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      + Insert variable
    </button>
  );
}

/* ─── Variable label fields (after body typed) ────────────── */
function VariableLabels({
  body, labels, onChange,
}: { body: string; labels: Record<string, string>; onChange: (n: string, v: string) => void }) {
  const vars = extractVariables(body);
  if (!vars.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ ...labelStyle, margin: "0 0 8px" }}>Variable sample values</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {vars.map(v => {
          const n = v.replace(/\D/g, "");
          return (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                flexShrink: 0, background: "rgba(56,0,8,0.08)", color: "var(--burgundy)",
                borderRadius: 4, padding: "3px 8px", fontSize: 12, fontWeight: 700,
                fontFamily: "monospace",
              }}>{v}</span>
              <input
                style={{ ...inputStyle, padding: "7px 12px" }}
                placeholder={`Label for ${v} (e.g. customer name)`}
                value={labels[n] ?? ""}
                onChange={e => onChange(n, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Button row ────────────────────────────────────────── */
function ButtonRow({
  btn, onUpdate, onRemove,
}: { btn: ButtonItem; onUpdate: (patch: Partial<ButtonItem>) => void; onRemove: () => void }) {
  const labelMap: Record<string, string> = {
    QUICK_REPLY:  "Quick reply",
    URL:          "Visit website",
    PHONE_NUMBER: "Call phone",
  };

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px",
      background: "var(--cream)", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {labelMap[btn.subtype] ?? btn.subtype}
        </span>
        <button
          type="button"
          onClick={onRemove}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#DC2626", borderRadius: 4 }}
          onMouseOver={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
          onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <input
        style={{ ...inputStyle, padding: "8px 12px" }}
        placeholder="Button label (e.g. Shop now)"
        maxLength={25}
        value={btn.text}
        onChange={e => onUpdate({ text: e.target.value })}
      />

      {btn.subtype === "URL" && (
        <input
          style={{ ...inputStyle, padding: "8px 12px" }}
          placeholder="https://example.com"
          value={btn.value}
          onChange={e => onUpdate({ value: e.target.value })}
        />
      )}
      {btn.subtype === "PHONE_NUMBER" && (
        <input
          style={{ ...inputStyle, padding: "8px 12px" }}
          placeholder="+91 98765 43210"
          value={btn.value}
          onChange={e => onUpdate({ value: e.target.value })}
        />
      )}
    </div>
  );
}

/* ─── Add button menu ───────────────────────────────────── */
function AddButtonMenu({ onAdd }: { onAdd: (subtype: ButtonItem["subtype"]) => void }) {
  const options: { subtype: ButtonItem["subtype"]; label: string }[] = [
    { subtype: "QUICK_REPLY",  label: "Quick reply" },
    { subtype: "URL",          label: "Visit website" },
    { subtype: "PHONE_NUMBER", label: "Call phone" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button
          key={opt.subtype}
          type="button"
          onClick={() => onAdd(opt.subtype)}
          style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            border: "1.5px solid var(--border)", background: "white", cursor: "pointer",
            color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6,
            transition: "border-color 0.15s",
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = "var(--burgundy)")}
          onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <Plus size={11} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export function StepContent({ state, dispatch }: { state: CreateTemplateState; dispatch: any }) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { errors } = state;
  const uid = useId();

  /* Auto-expand textarea */
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = bodyRef.current.scrollHeight + "px";
    }
  }, [state.body]);

  /* Insert variable at cursor */
  function insertVar() {
    if (!bodyRef.current) return;
    const idx  = nextVariableIndex(state.body);
    const text = insertAtCursor(bodyRef.current, `{{${idx}}}`);
    dispatch({ type: "SET_FIELD", field: "body", value: text });
    setTimeout(() => bodyRef.current?.focus(), 0);
  }

  /* Add button */
  function addButton(subtype: ButtonItem["subtype"]) {
    const item: ButtonItem = {
      id:      crypto.randomUUID(),
      subtype,
      text:    "",
      value:   "",
    };
    dispatch({ type: "ADD_BUTTON", item });
    if (!state.buttons.enabled) dispatch({ type: "SET_BUTTONS", patch: { enabled: true } });
  }

  const headerTypes = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"] as const;

  return (
    <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

      {/* ── Header (optional) ─────────────────────────────── */}
      <div style={sectionStyle}>
        <SectionToggle
          label="Header"
          hint="Optional — image, video, or short text at the top"
          enabled={state.header.enabled}
          onToggle={() => dispatch({ type: "SET_HEADER", patch: { enabled: !state.header.enabled } })}
        />
        {state.header.enabled && (
          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)" }}>
            {/* Type selector */}
            <div style={{ paddingTop: 14 }}>
              <p style={{ ...labelStyle, margin: "0 0 8px" }}>Header type</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {headerTypes.map(t => {
                  const sel = state.header.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => dispatch({ type: "SET_HEADER", patch: { type: t } })}
                      style={{
                        flex: "1 1 auto", minWidth: 80,
                        padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
                        border: `1.5px solid ${sel ? "var(--burgundy)" : "var(--border)"}`,
                        background: sel ? "rgba(56,0,8,0.06)" : "white",
                        color: sel ? "var(--burgundy)" : "var(--text-mid)",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text input if TEXT type */}
            {state.header.type === "TEXT" && (
              <div>
                <p style={{ ...labelStyle, margin: "0 0 6px" }}>Header text</p>
                <input
                  style={{ ...inputStyle, borderColor: errors.headerText ? "#DC2626" : "var(--border)" }}
                  placeholder="e.g. 🎉 Special offer for you"
                  maxLength={60}
                  value={state.header.text}
                  onChange={e => dispatch({ type: "SET_HEADER", patch: { text: e.target.value } })}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  {state.header.text.length}/60 characters
                </p>
                {errors.headerText && <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.headerText}</p>}
              </div>
            )}

            {/* Media hint if not TEXT */}
            {state.header.type !== "TEXT" && (
              <div style={{
                background: "var(--cream)", borderRadius: 8, padding: "10px 12px",
                border: "1px dashed var(--border)", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                  {state.header.type} will be uploaded when you send the message via the API
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Body (required) ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor={uid + "-body"} style={labelStyle}>
            Message body <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <InsertVarButton onClick={insertVar} />
        </div>

        <textarea
          id={uid + "-body"}
          ref={bodyRef}
          rows={5}
          style={{
            ...inputStyle,
            resize: "none", overflow: "hidden", lineHeight: 1.6,
            borderColor: errors.body ? "#DC2626" : "var(--border)",
          }}
          placeholder={"Hi {{1}}, your order {{2}} has been shipped! Track at {{3}}"}
          value={state.body}
          onChange={e => dispatch({ type: "SET_FIELD", field: "body", value: e.target.value })}
          onFocus={e  => (e.currentTarget.style.borderColor = errors.body ? "#DC2626" : "var(--text-dark)")}
          onBlur={e   => (e.currentTarget.style.borderColor = errors.body ? "#DC2626" : "var(--border)")}
          maxLength={1024}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {errors.body
            ? <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>{errors.body}</p>
            : <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Use {"{{"} 1 {"}}"}, {"{{"} 2 {"}}"} etc. for personalised variables</p>
          }
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, flexShrink: 0, marginLeft: 8 }}>
            {state.body.length}/1024
          </p>
        </div>

        {/* Variable labels */}
        <VariableLabels
          body={state.body}
          labels={state.variableLabels}
          onChange={(n, v) => dispatch({ type: "SET_FIELD", field: "variableLabels", value: { ...state.variableLabels, [n]: v } })}
        />
      </div>

      {/* ── Footer (optional) ─────────────────────────────── */}
      <div style={sectionStyle}>
        <SectionToggle
          label="Footer"
          hint="Optional — short note below the body (e.g. unsubscribe text)"
          enabled={state.footer.enabled}
          onToggle={() => dispatch({ type: "SET_FOOTER", patch: { enabled: !state.footer.enabled } })}
        />
        {state.footer.enabled && (
          <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <input
              style={{ ...inputStyle, borderColor: errors.footer ? "#DC2626" : "var(--border)" }}
              placeholder="Not interested? Reply STOP"
              maxLength={60}
              value={state.footer.text}
              onChange={e => dispatch({ type: "SET_FOOTER", patch: { text: e.target.value } })}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>
              {state.footer.text.length}/60 characters
            </p>
            {errors.footer && <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.footer}</p>}
          </div>
        )}
      </div>

      {/* ── Buttons (optional) ────────────────────────────── */}
      <div style={sectionStyle}>
        <SectionToggle
          label="Buttons"
          hint="Optional — quick replies, links, or call-to-action"
          enabled={state.buttons.enabled}
          onToggle={() => dispatch({ type: "SET_BUTTONS", patch: { enabled: !state.buttons.enabled } })}
        />
        {state.buttons.enabled && (
          <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {state.buttons.items.map(btn => (
              <ButtonRow
                key={btn.id}
                btn={btn}
                onUpdate={patch => dispatch({ type: "UPDATE_BUTTON", id: btn.id, patch })}
                onRemove={() => dispatch({ type: "REMOVE_BUTTON", id: btn.id })}
              />
            ))}
            {state.buttons.items.length < 3 && (
              <div>
                <p style={{ ...labelStyle, margin: "0 0 8px" }}>Add button</p>
                <AddButtonMenu onAdd={addButton} />
              </div>
            )}
            {errors.buttons && <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>{errors.buttons}</p>}
          </div>
        )}
      </div>

    </div>
  );
}
