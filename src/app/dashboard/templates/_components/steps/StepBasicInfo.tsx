import { CATEGORIES, LANGUAGES } from "../../_lib/templateHelpers";
import type { CreateTemplateState } from "../../_hooks/useCreateTemplate";
import type { Dispatch } from "react";
import type { Action } from "../../_hooks/useCreateTemplate";

// Re-export Action type for use in parent
export type { Action };

const inputStyle: React.CSSProperties = {
  padding:"11px 14px", borderRadius:"var(--radius-btn)",
  border:"1.5px solid var(--border)", background:"white",
  fontSize:14, color:"var(--text-dark)", outline:"none",
  width:"100%", transition:"border-color 0.2s",
  fontFamily:"var(--font-dm-sans,'DM Sans',sans-serif)",
};

interface Props {
  state:    CreateTemplateState;
  dispatch: Dispatch<Parameters<typeof import("../../_hooks/useCreateTemplate")["useCreateTemplate"]>[0]>;
}

// We accept dispatch directly via a simpler typed approach
export function StepBasicInfo({ state, dispatch }: {
  state: CreateTemplateState;
  dispatch: any;
}) {
  const { errors } = state;

  return (
    <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>

      {/* Template name */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <label style={{ fontSize:12, fontWeight:600, color:"var(--text-dark)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
          Template name <span style={{ color:"#DC2626" }}>*</span>
        </label>
        <input
          style={{ ...inputStyle, borderColor: errors.name ? "#DC2626" : "var(--border)" }}
          placeholder="e.g. order_confirmation"
          value={state.name}
          onChange={e => dispatch({ type:"SET_FIELD", field:"name", value:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"") })}
          onFocus={e  => (e.currentTarget.style.borderColor = errors.name ? "#DC2626" : "var(--text-dark)")}
          onBlur={e   => (e.currentTarget.style.borderColor = errors.name ? "#DC2626" : "var(--border)")}
          maxLength={512}
        />
        {errors.name
          ? <p style={{ fontSize:12, color:"#DC2626", margin:0 }}>{errors.name}</p>
          : <p style={{ fontSize:12, color:"var(--text-muted)", margin:0 }}>Lowercase letters, numbers, underscores only</p>
        }
      </div>

      {/* Category */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <label style={{ fontSize:12, fontWeight:600, color:"var(--text-dark)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
          Category <span style={{ color:"#DC2626" }}>*</span>
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {CATEGORIES.map(cat => {
            const selected = state.category === cat.value;
            return (
              <button key={cat.value}
                onClick={() => dispatch({ type:"SET_FIELD", field:"category", value:cat.value })}
                style={{
                  padding:"14px 12px", borderRadius:12, cursor:"pointer", textAlign:"left",
                  border:`1.5px solid ${selected ? "var(--text-dark)" : "var(--border)"}`,
                  background: selected ? "var(--text-dark)" : "white",
                  transition:"all 0.15s",
                }}
              >
                <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:700, color: selected ? "white" : "var(--text-dark)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {cat.label}
                </p>
                <p style={{ margin:0, fontSize:11, color: selected ? "rgba(255,255,255,0.6)" : "var(--text-muted)", lineHeight:1.4 }}>
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
        {errors.category && <p style={{ fontSize:12, color:"#DC2626", margin:0 }}>{errors.category}</p>}
      </div>

      {/* Language */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <label style={{ fontSize:12, fontWeight:600, color:"var(--text-dark)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
          Language <span style={{ color:"#DC2626" }}>*</span>
        </label>
        <div style={{ position:"relative" }}>
          <select
            style={{ ...inputStyle, appearance:"none", cursor:"pointer" }}
            value={state.language}
            onChange={e => dispatch({ type:"SET_FIELD", field:"language", value:e.target.value })}
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text-muted)", fontSize:12 }}>▾</span>
        </div>
        <p style={{ fontSize:12, color:"var(--text-muted)", margin:0 }}>
          Brands can only have one template with the same name per language
        </p>
      </div>
    </div>
  );
}
