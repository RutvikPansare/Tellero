"use client";

import { useState, useReducer, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Plus, Megaphone, Users, CheckCircle2, Clock,
  AlertCircle, Loader2, Send, X, ChevronRight,
  MessageSquare, TrendingUp, Eye, FileText, PenLine,
} from "lucide-react";
import { broadcastStatusMeta, type BroadcastStatus } from "@/lib/design-system";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ──────────────────────────────────────────────── */

interface Broadcast {
  id: string; name: string; message: string; segment: string;
  status: BroadcastStatus; scheduled_at: string | null; sent_at: string | null;
  total_recipients: number; delivered: number; opened: number;
  replied: number; created_at: string;
}

interface ApprovedTemplate {
  id:         string;
  name:       string;
  body:       string | null;
  components: Array<{ type: string; text?: string }> | null;
}

/* ─── Seed data ──────────────────────────────────────────── */

const SEED: Broadcast[] = [
  {
    id: "1", name: "Diwali Flash Sale",
    message: "🪔 Diwali offer for you! Get 20% off your favourite products. Shop now 👉 {{link}}",
    segment: "All customers", status: "sent", scheduled_at: null,
    sent_at: "2025-10-20T10:00:00Z", total_recipients: 1842,
    delivered: 1791, opened: 1203, replied: 87, created_at: "2025-10-19T14:00:00Z",
  },
  {
    id: "2", name: "Win-back: 60-day inactive",
    message: "Hi {{name}}, we miss you! 👋 Here's 15% off to welcome you back: {{link}}",
    segment: "At-risk customers", status: "sent", scheduled_at: null,
    sent_at: "2025-11-01T09:30:00Z", total_recipients: 324,
    delivered: 319, opened: 241, replied: 43, created_at: "2025-10-31T18:00:00Z",
  },
  {
    id: "3", name: "New product drop — Vitamin C Serum",
    message: "Introducing our new Vitamin C Serum ✨ Limited launch stock 👉 {{link}}",
    segment: "Skincare buyers", status: "scheduled", scheduled_at: "2025-12-05T08:00:00Z",
    sent_at: null, total_recipients: 892, delivered: 0, opened: 0, replied: 0,
    created_at: "2025-11-28T11:00:00Z",
  },
  {
    id: "4", name: "Reorder nudge — supplements",
    message: "Hey {{name}} 👋 Your protein supplements should be running low. Reorder: {{link}}",
    segment: "Supplement buyers", status: "draft", scheduled_at: null,
    sent_at: null, total_recipients: 0, delivered: 0, opened: 0, replied: 0,
    created_at: "2025-11-30T09:00:00Z",
  },
];

/* ─── Modal state machine ────────────────────────────────── */

type Step         = "compose" | "audience" | "review" | "sending" | "done";
type MessageSource = "template" | "custom";

interface ModalState {
  open:          boolean;
  step:          Step;
  messageSource: MessageSource;
  templateId:    string;          // id of selected approved template
  templateName:  string;
  name:          string;
  message:       string;
  segment:       string;
  scheduleType:  "now" | "later";
  scheduleDate:  string;
  scheduleTime:  string;
  sending:       boolean;
  error:         string | null;
}

type ModalAction =
  | { type: "OPEN" }
  | { type: "OPEN_WITH_TEMPLATE"; templateId: string; templateName: string; message: string }
  | { type: "CLOSE" }
  | { type: "SET"; field: keyof ModalState; value: string | boolean }
  | { type: "SET_SOURCE"; source: MessageSource }
  | { type: "SET_TEMPLATE"; id: string; name: string; message: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "START_SEND" }
  | { type: "DONE" }
  | { type: "ERROR"; message: string };

const STEPS: Step[] = ["compose", "audience", "review", "sending", "done"];

const initialModal: ModalState = {
  open: false, step: "compose",
  messageSource: "template", templateId: "", templateName: "",
  name: "", message: "",
  segment: "all", scheduleType: "now", scheduleDate: "",
  scheduleTime: "", sending: false, error: null,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN":      return { ...initialModal, open: true };
    case "OPEN_WITH_TEMPLATE":
      return {
        ...initialModal, open: true,
        messageSource: "template",
        templateId:   action.templateId,
        templateName: action.templateName,
        message:      action.message,
      };
    case "CLOSE":     return { ...state, open: false };
    case "SET":       return { ...state, [action.field]: action.value };
    case "SET_SOURCE":
      return { ...state, messageSource: action.source, templateId: "", templateName: "", message: "" };
    case "SET_TEMPLATE":
      return { ...state, templateId: action.id, templateName: action.name, message: action.message };
    case "NEXT_STEP": return { ...state, step: STEPS[Math.min(STEPS.indexOf(state.step) + 1, STEPS.length - 1)] };
    case "PREV_STEP": return { ...state, step: STEPS[Math.max(STEPS.indexOf(state.step) - 1, 0)] };
    case "START_SEND":return { ...state, step: "sending", sending: true };
    case "DONE":      return { ...state, step: "done", sending: false };
    case "ERROR":     return { ...state, sending: false, error: action.message };
    default:          return state;
  }
}

/* ─── Segments ───────────────────────────────────────────── */

const SEGMENTS = [
  { value: "all",    label: "All customers",             count: "2,148" },
  { value: "at_risk",label: "At-risk (60-day inactive)", count: "324"   },
  { value: "vip",    label: "VIP (top 10% spenders)",    count: "215"   },
  { value: "cart",   label: "Abandoned cart (7 days)",   count: "487"   },
  { value: "cod",    label: "COD buyers",                count: "1,021" },
  { value: "repeat", label: "Repeat buyers",             count: "842"   },
];

/* ─── Status badge ───────────────────────────────────────── */

const STATUS_CREAM: Record<BroadcastStatus, { bg: string; text: string; border: string }> = {
  draft:     { bg: "rgba(26,20,17,0.05)",  text: "var(--text-muted)",  border: "var(--border)"         },
  scheduled: { bg: "rgba(99,102,241,0.08)",text: "#6366F1",            border: "rgba(99,102,241,0.2)"  },
  sending:   { bg: "rgba(251,191,36,0.1)", text: "#B45309",            border: "rgba(251,191,36,0.3)"  },
  sent:      { bg: "rgba(37,211,102,0.1)", text: "#15803D",            border: "rgba(37,211,102,0.25)" },
  failed:    { bg: "rgba(239,68,68,0.08)", text: "#DC2626",            border: "rgba(239,68,68,0.2)"   },
};

function StatusBadge({ status }: { status: BroadcastStatus }) {
  const c = STATUS_CREAM[status];
  const meta = broadcastStatusMeta[status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:99, fontSize:11, fontWeight:600, background:c.bg, color:c.text,
      border:`1px solid ${c.border}` }}>
      {status === "sending"   && <Loader2    size={10} className="animate-spin" />}
      {status === "sent"      && <CheckCircle2 size={10} />}
      {status === "scheduled" && <Clock      size={10} />}
      {status === "failed"    && <AlertCircle size={10} />}
      {meta.label}
    </span>
  );
}

/* ─── Stat card ──────────────────────────────────────────── */

function StatCard({ label, value, sub, icon: Icon, accent = "var(--accent)" }:
  { label: string; value: string; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <div className="card p-5 flex flex-col gap-3" style={{ overflow:"visible" }}>
      <div className="flex items-center justify-between">
        <p className="label">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background:`${accent}15`, border:`1px solid ${accent}25` }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="heading-md" style={{ color:"var(--text-dark)", lineHeight:1 }}>{value}</p>
        {sub && <p className="body-sm" style={{ fontSize:12, marginTop:4 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Broadcast table row ────────────────────────────────── */

function BroadcastRow({ b, onClick }: { b: Broadcast; onClick: () => void }) {
  const deliveryRate = b.total_recipients > 0 ? Math.round(b.delivered / b.total_recipients * 100) : 0;
  const openRate     = b.delivered > 0         ? Math.round(b.opened    / b.delivered    * 100) : 0;
  return (
    <tr className="group cursor-pointer transition-colors"
      style={{ borderBottom:"1px solid var(--border)" }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--cream)")}
      onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
      onClick={onClick}>
      <td className="px-5 py-4">
        <p style={{ fontSize:14, fontWeight:500, color:"var(--text-dark)" }}>{b.name}</p>
        <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2, maxWidth:320 }}
          className="line-clamp-1">{b.message}</p>
      </td>
      <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
      <td className="px-5 py-4">
        <p style={{ fontSize:13, color:"var(--text-mid)" }}>{b.segment}</p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize:14, fontWeight:500, color:"var(--text-dark)" }}>
          {b.total_recipients > 0 ? b.total_recipients.toLocaleString() : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize:13, color: b.status==="sent" ? "#15803D" : "var(--text-muted)" }}>
          {b.status==="sent" ? `${deliveryRate}%` : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize:13, color: b.status==="sent" ? "var(--text-mid)" : "var(--text-muted)" }}>
          {b.status==="sent" ? `${openRate}%` : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize:12, color:"var(--text-muted)" }}>
          {b.sent_at ? new Date(b.sent_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})
            : b.scheduled_at ? `Sched. ${new Date(b.scheduled_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}`
            : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <ChevronRight size={14} style={{ color:"var(--border)" }}
          className="inline group-hover:text-[var(--text-muted)] transition-colors" />
      </td>
    </tr>
  );
}

/* ─── WhatsApp preview ───────────────────────────────────── */

function MessagePreview({ message }: { message: string }) {
  const display = message.replace(/\{\{name\}\}/g,"Priya").replace(/\{\{1\}\}/g,"Priya").replace(/\{\{link\}\}/g,"tellero.in/s/abc");
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background:"#ECE5DD", minHeight:120 }}>
      <p style={{ fontSize:11, fontWeight:600, color:"rgba(0,0,0,0.35)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Preview</p>
      {message ? (
        <div style={{ background:"white", borderRadius:"12px 12px 12px 0",
          padding:"10px 14px", fontSize:13, lineHeight:1.55, maxWidth:280,
          boxShadow:"0 1px 2px rgba(0,0,0,0.1)" }}>
          <p style={{ margin:0, color:"var(--text-dark)", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{display}</p>
          <div className="flex items-center gap-1 mt-1.5 justify-end">
            <span style={{ fontSize:10, color:"rgba(0,0,0,0.35)" }}>
              {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
            </span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize:12, color:"rgba(0,0,0,0.35)" }}>Your message will appear here…</p>
      )}
    </div>
  );
}

/* ─── Step dots ──────────────────────────────────────────── */

function StepDots({ step }: { step: Step }) {
  const visible: Step[] = ["compose","audience","review"];
  const idx = visible.indexOf(step);
  if (idx < 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {visible.map((_,i) => (
        <div key={i} className="rounded-full transition-all" style={{
          width: i===idx ? 20 : 6, height: 6,
          background: i<=idx ? "var(--burgundy)" : "var(--border)",
        }} />
      ))}
    </div>
  );
}

/* ─── Input style ────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  padding:"11px 14px", borderRadius:"var(--radius-btn)",
  border:"1.5px solid var(--border)", background:"white",
  fontSize:14, color:"var(--text-dark)", outline:"none",
  width:"100%", transition:"border-color 0.2s",
  fontFamily:"var(--font-dm-sans,'DM Sans',sans-serif)",
};

/* ─── Template picker ────────────────────────────────────── */

function TemplatePicker({
  selectedId, onSelect,
}: { selectedId: string; onSelect: (t: ApprovedTemplate) => void }) {
  const [templates, setTemplates] = useState<ApprovedTemplate[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/templates/approved");
        if (!res.ok) throw new Error("Failed to load templates");
        const json = await res.json();
        setTemplates(json.templates ?? []);
      } catch (err) {
        console.error("[TemplatePicker] load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function bodyText(t: ApprovedTemplate): string {
    const bodyComp = (t.components ?? []).find((c: any) => c.type === "BODY");
    return bodyComp?.text ?? t.body ?? "";
  }

  if (loading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height:64, borderRadius:10, background:"var(--cream-2)", border:"1px solid var(--border)" }} />
        ))}
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div style={{
        padding:"24px 20px", borderRadius:12, textAlign:"center",
        background:"var(--cream)", border:"1.5px dashed var(--border)",
      }}>
        <FileText size={22} style={{ color:"var(--text-muted)", marginBottom:8 }} />
        <p style={{ margin:0, fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>No approved templates yet</p>
        <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--text-muted)" }}>
          Create and get a template approved in the Templates page first.
        </p>
        <a href="/dashboard/templates" style={{ display:"inline-block", marginTop:12, fontSize:12, fontWeight:700, color:"var(--burgundy)", textDecoration:"none" }}>
          Go to Templates →
        </a>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {templates.map(t => {
        const sel  = selectedId === t.id;
        const body = bodyText(t);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            style={{
              display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4,
              padding:"12px 14px", borderRadius:10, cursor:"pointer", textAlign:"left",
              border:`1.5px solid ${sel ? "var(--burgundy)" : "var(--border)"}`,
              background: sel ? "rgba(56,0,8,0.04)" : "white",
              transition:"all 0.15s",
            }}
            onMouseOver={e => { if (!sel) e.currentTarget.style.borderColor = "var(--text-mid)"; }}
            onMouseOut={e  => { if (!sel) e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:8, width:"100%" }}>
              <span style={{ fontSize:13, fontWeight:700, color: sel ? "var(--burgundy)" : "var(--text-dark)", flex:1 }}>
                {t.name}
              </span>
              {sel && (
                <span style={{
                  fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em",
                  background:"rgba(56,0,8,0.08)", color:"var(--burgundy)",
                  border:"1px solid rgba(56,0,8,0.15)", borderRadius:99, padding:"2px 8px",
                }}>
                  Selected
                </span>
              )}
            </div>
            {body && (
              <p style={{
                margin:0, fontSize:12, color:"var(--text-muted)", lineHeight:1.5,
                overflow:"hidden", display:"-webkit-box",
                WebkitLineClamp:2, WebkitBoxOrient:"vertical",
              }}>
                {body}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Create broadcast modal ─────────────────────────────── */

function CreateModal({ state, dispatch, onCreated }:
  { state: ModalState; dispatch: React.Dispatch<ModalAction>; onCreated: (b: Broadcast) => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === overlayRef.current) dispatch({ type:"CLOSE" });
  }

  async function handleSend() {
    dispatch({ type:"START_SEND" });
    await new Promise(r => setTimeout(r, 2200));
    const seg = SEGMENTS.find(s => s.value === state.segment);
    const newB: Broadcast = {
      id: Date.now().toString(),
      name: state.name || "Untitled broadcast",
      message: state.message,
      segment: seg?.label ?? "All customers",
      status: state.scheduleType==="later" ? "scheduled" : "sent",
      scheduled_at: state.scheduleType==="later" ? `${state.scheduleDate}T${state.scheduleTime}:00Z` : null,
      sent_at: state.scheduleType==="now" ? new Date().toISOString() : null,
      total_recipients: parseInt((seg?.count ?? "0").replace(",",""), 10),
      delivered: state.scheduleType==="now" ? parseInt((seg?.count ?? "0").replace(",",""),10) - Math.floor(Math.random()*30) : 0,
      opened: 0, replied: 0, created_at: new Date().toISOString(),
    };
    dispatch({ type:"DONE" });
    onCreated(newB);
  }

  if (!state.open) return null;
  const seg = SEGMENTS.find(s => s.value === state.segment);

  const canContinue = state.step !== "compose" || (
    !!state.name && (
      state.messageSource === "custom"
        ? !!state.message
        : !!state.templateId
    )
  );

  return (
    <div ref={overlayRef} onClick={handleOverlay} className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background:"rgba(26,20,17,0.45)", backdropFilter:"blur(3px)", WebkitBackdropFilter:"blur(3px)" }}>
      <div className="w-full flex flex-col" style={{
        background:"white", borderRadius:18, border:"1px solid var(--border)",
        boxShadow:"0 24px 64px rgba(0,0,0,0.18)", maxWidth:780, maxHeight:"90vh",
        margin:"0 16px", overflow:"hidden",
      }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:"rgba(56,0,8,0.07)", border:"1px solid rgba(56,0,8,0.12)" }}>
              <Megaphone size={13} style={{ color:"var(--burgundy)" }} />
            </div>
            <p style={{ fontSize:15, fontWeight:600, color:"var(--text-dark)" }}>
              {state.step==="done" ? "Broadcast sent!" : "New broadcast"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StepDots step={state.step} />
            <button onClick={() => dispatch({ type:"CLOSE" })}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color:"var(--text-muted)", background:"var(--cream)", border:"1px solid var(--border)", cursor:"pointer" }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight:0, background:"white" }}>

          {/* ── Step 1: Compose ── */}
          {state.step==="compose" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left column */}
              <div className="flex flex-col gap-5">
                {/* Broadcast name */}
                <div className="flex flex-col gap-1.5">
                  <label className="label" style={{ color:"var(--text-dark)" }}>Broadcast name</label>
                  <input style={inputStyle} placeholder="e.g. Diwali flash sale"
                    value={state.name}
                    onChange={e => dispatch({ type:"SET", field:"name", value:e.target.value })}
                    onFocus={e => (e.currentTarget.style.borderColor="var(--text-dark)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="var(--border)")} />
                </div>

                {/* Message source toggle */}
                <div className="flex flex-col gap-2">
                  <p className="label" style={{ color:"var(--text-dark)" }}>Message</p>
                  <div style={{ display:"flex", gap:6 }}>
                    {([
                      { src: "template" as MessageSource, icon: FileText, label: "Use template" },
                      { src: "custom"   as MessageSource, icon: PenLine,  label: "Custom message" },
                    ]).map(({ src, icon: Icon, label }) => {
                      const sel = state.messageSource === src;
                      return (
                        <button key={src} type="button"
                          onClick={() => dispatch({ type:"SET_SOURCE", source: src })}
                          style={{
                            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                            padding:"9px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600,
                            border:`1.5px solid ${sel ? "var(--burgundy)" : "var(--border)"}`,
                            background: sel ? "rgba(56,0,8,0.05)" : "white",
                            color: sel ? "var(--burgundy)" : "var(--text-mid)",
                            transition:"all 0.15s",
                          }}>
                          <Icon size={12} />{label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Template picker */}
                  {state.messageSource === "template" && (
                    <TemplatePicker
                      selectedId={state.templateId}
                      onSelect={t => {
                        const bodyComp = (t.components ?? []).find((c: any) => c.type === "BODY");
                        const body = bodyComp?.text ?? t.body ?? "";
                        dispatch({ type:"SET_TEMPLATE", id: t.id, name: t.name, message: body });
                      }}
                    />
                  )}

                  {/* Custom textarea */}
                  {state.messageSource === "custom" && (
                    <>
                      <textarea style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} rows={6}
                        placeholder="Hi {{1}} 👋 We have something special for you…"
                        value={state.message}
                        onChange={e => dispatch({ type:"SET", field:"message", value:e.target.value })}
                        onFocus={e => (e.currentTarget.style.borderColor="var(--text-dark)")}
                        onBlur={e  => (e.currentTarget.style.borderColor="var(--border)")} />
                      <p className="text-right" style={{ fontSize:11, color: state.message.length>1000 ? "#DC2626" : "var(--text-muted)" }}>
                        {state.message.length}/1000
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Right column — preview */}
              <div className="flex flex-col gap-3">
                <p className="label" style={{ color:"var(--text-dark)" }}>Live preview</p>
                <MessagePreview message={state.message} />
                {state.messageSource === "template" && state.templateName && (
                  <div style={{ padding:"10px 12px", borderRadius:8, background:"rgba(56,0,8,0.04)", border:"1px solid rgba(56,0,8,0.1)" }}>
                    <p style={{ margin:0, fontSize:12, color:"var(--text-muted)" }}>Template</p>
                    <p style={{ margin:"2px 0 0", fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{state.templateName}</p>
                  </div>
                )}
                <div className="card-cream p-4 flex flex-col gap-2">
                  <p className="label">Tips</p>
                  {["Approved templates have higher delivery rates","Emojis boost open rates by ~18%","Always include your brand name"].map(tip => (
                    <div key={tip} className="flex items-start gap-2">
                      <span style={{ color:"var(--burgundy)", fontSize:11, marginTop:2 }}>✓</span>
                      <p className="body-sm" style={{ fontSize:12 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Audience ── */}
          {state.step==="audience" && (
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="label" style={{ color:"var(--text-dark)" }}>Choose segment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SEGMENTS.map(seg => (
                    <button key={seg.value}
                      onClick={() => dispatch({ type:"SET", field:"segment", value:seg.value })}
                      className="flex items-center justify-between p-4 rounded-xl transition-all text-left"
                      style={{ background: state.segment===seg.value ? "white" : "var(--cream-2)",
                        border:`1.5px solid ${state.segment===seg.value ? "var(--burgundy)" : "var(--border)"}`,
                        cursor:"pointer" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: state.segment===seg.value ? "var(--burgundy)" : "rgba(26,20,17,0.2)",
                            background: state.segment===seg.value ? "var(--burgundy)" : "transparent" }} />
                        <span style={{ fontSize:14, color:"var(--text-dark)", fontWeight: state.segment===seg.value ? 600 : 400 }}>
                          {seg.label}
                        </span>
                      </div>
                      <span style={{ fontSize:12, color:"var(--text-muted)", background:"var(--cream-3)",
                        padding:"2px 8px", borderRadius:99, border:"1px solid var(--border)" }}>
                        {seg.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="label" style={{ color:"var(--text-dark)" }}>Send time</p>
                <div className="flex gap-2">
                  {(["now","later"] as const).map(t => (
                    <button key={t} onClick={() => dispatch({ type:"SET", field:"scheduleType", value:t })}
                      className="flex-1 py-3 rounded-xl font-medium transition-all"
                      style={{ fontSize:14, cursor:"pointer",
                        background: state.scheduleType===t ? "var(--text-dark)" : "white",
                        border:`1.5px solid ${state.scheduleType===t ? "var(--text-dark)" : "var(--border)"}`,
                        color: state.scheduleType===t ? "white" : "var(--text-mid)" }}>
                      {t==="now" ? "Send now" : "Schedule for later"}
                    </button>
                  ))}
                </div>
                {state.scheduleType==="later" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[{label:"Date",type:"date",field:"scheduleDate",value:state.scheduleDate},
                      {label:"Time",type:"time",field:"scheduleTime",value:state.scheduleTime}].map(({label,type,field,value}) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className="label" style={{ color:"var(--text-dark)" }}>{label}</label>
                        <input type={type} style={inputStyle} value={value}
                          onChange={e => dispatch({ type:"SET", field:field as keyof ModalState, value:e.target.value })}
                          onFocus={e => (e.currentTarget.style.borderColor="var(--text-dark)")}
                          onBlur={e  => (e.currentTarget.style.borderColor="var(--border)")} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {state.step==="review" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <p className="label" style={{ color:"var(--text-dark)" }}>Review before sending</p>
                {[
                  { l:"Name",        v: state.name||"Untitled" },
                  { l:"Template",    v: state.messageSource==="template" ? state.templateName : "Custom message" },
                  { l:"Segment",     v: seg?.label ?? "" },
                  { l:"Recipients",  v: seg?.count ?? "" },
                  { l:"Send time",   v: state.scheduleType==="now" ? "Immediately" : `${state.scheduleDate} at ${state.scheduleTime}` },
                ].map(item => (
                  <div key={item.l} className="flex items-center justify-between py-3"
                    style={{ borderBottom:"1px solid var(--border)" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>{item.l}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)" }}>{item.v}</span>
                  </div>
                ))}
                <div className="card-cream p-4 rounded-xl" style={{ border:"1px solid rgba(251,191,36,0.3)", background:"rgba(251,191,36,0.08)" }}>
                  <p style={{ fontSize:13, color:"#B45309" }}>
                    ⚠️ WhatsApp broadcasts are irreversible once sent. Double-check your message and audience.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="label" style={{ color:"var(--text-dark)" }}>Message preview</p>
                <MessagePreview message={state.message} />
              </div>
            </div>
          )}

          {/* ── Step 4: Sending ── */}
          {state.step==="sending" && (
            <div className="p-16 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background:"rgba(56,0,8,0.07)", border:"2px solid rgba(56,0,8,0.15)" }}>
                <Loader2 size={28} style={{ color:"var(--burgundy)" }} className="animate-spin" />
              </div>
              <div className="text-center">
                <p className="heading-sm" style={{ color:"var(--text-dark)" }}>Sending broadcast…</p>
                <p className="body-md" style={{ marginTop:4 }}>Queuing messages to {seg?.count} recipients</p>
              </div>
            </div>
          )}

          {/* ── Step 5: Done ── */}
          {state.step==="done" && (
            <div className="p-16 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background:"rgba(56,0,8,0.07)", border:"2px solid rgba(56,0,8,0.15)" }}>
                <CheckCircle2 size={28} style={{ color:"var(--burgundy)" }} />
              </div>
              <div className="text-center">
                <p className="heading-sm" style={{ color:"var(--text-dark)" }}>
                  {state.scheduleType==="now" ? "Broadcast sent!" : "Broadcast scheduled!"}
                </p>
                <p className="body-md" style={{ marginTop:4 }}>
                  {state.scheduleType==="now"
                    ? `Messages are being delivered to ${seg?.count} customers.`
                    : `Scheduled for ${state.scheduleDate} at ${state.scheduleTime}.`}
                </p>
              </div>
              <button className="btn btn-outline" onClick={() => dispatch({ type:"CLOSE" })}>
                Back to broadcasts
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {state.step!=="sending" && state.step!=="done" && (
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop:"1px solid var(--border)", background:"white" }}>
            {state.step!=="compose"
              ? <button className="btn btn-outline" style={{ padding:"8px 18px", fontSize:13 }}
                  onClick={() => dispatch({ type:"PREV_STEP" })}>← Back</button>
              : <div />}
            {state.step==="review"
              ? <button className="btn btn-dark" onClick={handleSend}>
                  <Send size={14} />
                  {state.scheduleType==="now" ? "Send now" : "Schedule broadcast"}
                </button>
              : <button className="btn btn-dark"
                  style={{ opacity: canContinue ? 1 : 0.45 }}
                  disabled={!canContinue}
                  onClick={() => dispatch({ type:"NEXT_STEP" })}>
                  Continue →
                </button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function BroadcastPage() {
  const searchParams = useSearchParams();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(SEED);
  const [modal, dispatch] = useReducer(modalReducer, initialModal);

  /* Pre-select template from ?templateId= URL param */
  useEffect(() => {
    const templateId = searchParams.get("templateId");
    if (!templateId) return;

    async function loadAndOpen() {
      const supabase = createClient();
      const { data } = await (supabase as any)
        .from("templates")
        .select("id, name, body, components")
        .eq("id", templateId)
        .eq("status", "approved")
        .single();

      if (!data) return;
      const bodyComp = (data.components ?? []).find((c: any) => c.type === "BODY");
      const message  = bodyComp?.text ?? data.body ?? "";
      dispatch({ type:"OPEN_WITH_TEMPLATE", templateId: data.id, templateName: data.name, message });
    }

    loadAndOpen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreated(b: Broadcast) {
    setBroadcasts(prev => [b, ...prev]);
    setTimeout(() => dispatch({ type:"CLOSE" }), 2000);
  }

  const totalSent       = broadcasts.filter(b => b.status==="sent").length;
  const totalRecipients = broadcasts.reduce((a,b) => a+b.total_recipients, 0);
  const sentWithOpens   = broadcasts.filter(b => b.status==="sent" && b.delivered>0);
  const avgOpen         = sentWithOpens.length>0
    ? Math.round(sentWithOpens.reduce((a,b) => a+b.opened/b.delivered,0)/sentWithOpens.length*100)
    : 0;

  return (
    <>
      <Header
        title="Broadcasts"
        subtitle="Send WhatsApp campaigns to your customer segments"
        actions={
          <button className="btn btn-dark" style={{ padding:"9px 18px", fontSize:13 }}
            onClick={() => dispatch({ type:"OPEN" })}>
            <Plus size={14} /> New broadcast
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background:"var(--cream)" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total broadcasts"  value={broadcasts.length.toString()} sub={`${totalSent} sent`} icon={Megaphone} accent="var(--accent)" />
          <StatCard label="Total recipients"  value={totalRecipients.toLocaleString("en-IN")} sub="across all campaigns" icon={Users} accent="#6366F1" />
          <StatCard label="Avg. open rate"    value={`${avgOpen}%`} sub="WhatsApp avg. is 72%" icon={Eye} accent="#B45309" />
          <StatCard label="Revenue generated" value="₹84,000" sub="this month · tracked" icon={TrendingUp} accent="var(--burgundy)" />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom:"1px solid var(--border)" }}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)" }}>All broadcasts</p>
            <p style={{ fontSize:12, color:"var(--text-muted)" }}>{broadcasts.length} total</p>
          </div>

          {broadcasts.length===0 ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.15)" }}>
                <MessageSquare size={22} style={{ color:"var(--accent)" }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize:16, fontWeight:600, color:"var(--text-dark)" }}>No broadcasts yet</p>
                <p className="body-sm" style={{ marginTop:4 }}>Send your first WhatsApp campaign to start seeing results.</p>
              </div>
              <button className="btn btn-dark mt-2" onClick={() => dispatch({ type:"OPEN" })}>
                <Plus size={14} /> Create broadcast
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)", background:"white" }}>
                    {["Broadcast","Status","Segment","Recipients","Delivered","Opened","Date",""].map((h,i) => (
                      <th key={h+i} className={`px-5 py-3 ${["Recipients","Delivered","Opened","Date",""].includes(h) ? "text-right" : "text-left"}`}
                        style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", color:"var(--text-muted)", textTransform:"uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map(b => <BroadcastRow key={b.id} b={b} onClick={() => {}} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateModal state={modal} dispatch={dispatch} onCreated={handleCreated} />
    </>
  );
}
