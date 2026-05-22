import { interpolateVariables } from "../_lib/templateHelpers";
import type { HeaderType, ButtonItem } from "../_lib/templateHelpers";

interface Props {
  header?:         { type: HeaderType; text?: string };
  body:            string;
  footer?:         string;
  buttons?:        ButtonItem[];
  variableValues?: Record<string, string>;
}

/** Highlight {{N}} variables in body text */
function BodyText({ text, values = {} }: { text: string; values?: Record<string, string> }) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\{\{\d+\}\}$/.test(part)
          ? <span key={i} style={{ background:"rgba(56,0,8,0.12)", color:"var(--burgundy)", borderRadius:3, padding:"0 3px", fontWeight:600 }}>
              {values[part.replace(/\D/g,"")] || part}
            </span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

/** CSS-only phone frame — no images */
export function TemplatePreviewPhone({ header, body, footer, buttons, variableValues = {} }: Props) {
  const displayBody = body || "Your message will appear here…";

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      {/* Phone outer shell */}
      <div style={{
        width:240, border:"8px solid #1A1411", borderRadius:32,
        background:"#E5DDD5", boxShadow:"0 12px 40px rgba(0,0,0,0.18)",
        overflow:"hidden", fontFamily:"var(--font-dm-sans,'DM Sans',sans-serif)",
      }}>
        {/* Status bar */}
        <div style={{ background:"#075E54", padding:"6px 14px 4px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:11, fontWeight:700 }}>T</span>
            </div>
            <div>
              <p style={{ color:"white", fontSize:11, fontWeight:600, margin:0 }}>Tellero Brand</p>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:9, margin:0 }}>Business Account</p>
            </div>
          </div>
          <span style={{ color:"rgba(255,255,255,0.8)", fontSize:9 }}>9:41</span>
        </div>

        {/* Chat area */}
        <div style={{ padding:"10px 8px", minHeight:180, display:"flex", flexDirection:"column", gap:4 }}>
          {/* Message bubble */}
          <div style={{
            background:"white", borderRadius:"10px 10px 10px 2px",
            padding:0, maxWidth:"88%", alignSelf:"flex-start",
            boxShadow:"0 1px 2px rgba(0,0,0,0.1)", overflow:"hidden",
          }}>
            {/* Header */}
            {header?.type === "TEXT" && header.text && (
              <div style={{ padding:"8px 10px 4px", borderBottom:"1px solid #f0f0f0" }}>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#1A1411" }}>{header.text}</p>
              </div>
            )}
            {(header?.type === "IMAGE" || header?.type === "VIDEO" || header?.type === "DOCUMENT") && (
              <div style={{ background:"#E0E0E0", height:80, display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid #f0f0f0" }}>
                <span style={{ fontSize:9, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em" }}>{header.type}</span>
              </div>
            )}

            {/* Body */}
            <div style={{ padding:"8px 10px" }}>
              <p style={{ margin:0, fontSize:12, lineHeight:1.5, color:"#1A1411", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                <BodyText text={displayBody} values={variableValues} />
              </p>
            </div>

            {/* Footer */}
            {footer && (
              <div style={{ padding:"2px 10px 8px" }}>
                <p style={{ margin:0, fontSize:10, color:"#888" }}>{footer}</p>
              </div>
            )}

            {/* Timestamp */}
            <div style={{ padding:"2px 8px 6px", textAlign:"right" }}>
              <span style={{ fontSize:9, color:"#999" }}>
                {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
              </span>
            </div>
          </div>

          {/* Buttons */}
          {buttons && buttons.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:4, maxWidth:"88%" }}>
              {buttons.map((btn) => (
                <div key={btn.id} style={{
                  background:"white", border:"none", borderRadius:8,
                  padding:"7px 10px", textAlign:"center",
                  boxShadow:"0 1px 2px rgba(0,0,0,0.1)",
                }}>
                  <span style={{ fontSize:12, color:"#128C7E", fontWeight:600 }}>{btn.text || "Button"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
