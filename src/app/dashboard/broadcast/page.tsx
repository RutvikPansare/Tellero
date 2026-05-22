"use client";

import { useState, useReducer, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import {
  Plus,
  Megaphone,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Send,
  X,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Eye,
} from "lucide-react";
import { broadcastStatusMeta, type BroadcastStatus } from "@/lib/design-system";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */

interface Broadcast {
  id: string;
  name: string;
  message: string;
  segment: string;
  status: BroadcastStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  delivered: number;
  opened: number;
  replied: number;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────
   Demo seed data (replaced by real Supabase data once wired)
   ───────────────────────────────────────────────────────── */

const SEED: Broadcast[] = [
  {
    id: "1",
    name: "Diwali Flash Sale",
    message:
      "🪔 Diwali offer for you! Get 20% off your favourite products this Diwali. Shop now 👉 {{link}}",
    segment: "All customers",
    status: "sent",
    scheduled_at: null,
    sent_at: "2025-10-20T10:00:00Z",
    total_recipients: 1842,
    delivered: 1791,
    opened: 1203,
    replied: 87,
    created_at: "2025-10-19T14:00:00Z",
  },
  {
    id: "2",
    name: "Win-back: 60-day inactive",
    message:
      "Hi {{name}}, we miss you! 👋 It's been a while. Here's 15% off to welcome you back: {{link}}",
    segment: "At-risk customers",
    status: "sent",
    scheduled_at: null,
    sent_at: "2025-11-01T09:30:00Z",
    total_recipients: 324,
    delivered: 319,
    opened: 241,
    replied: 43,
    created_at: "2025-10-31T18:00:00Z",
  },
  {
    id: "3",
    name: "New product drop — Vitamin C Serum",
    message:
      "Introducing our new Vitamin C Serum ✨ Your skin will love this. Limited launch stock — grab yours 👉 {{link}}",
    segment: "Skincare buyers",
    status: "scheduled",
    scheduled_at: "2025-12-05T08:00:00Z",
    sent_at: null,
    total_recipients: 892,
    delivered: 0,
    opened: 0,
    replied: 0,
    created_at: "2025-11-28T11:00:00Z",
  },
  {
    id: "4",
    name: "Reorder nudge — supplements",
    message:
      "Hey {{name}} 👋 Your protein supplements should be running low. Reorder now and never miss a day: {{link}}",
    segment: "Supplement buyers",
    status: "draft",
    scheduled_at: null,
    sent_at: null,
    total_recipients: 0,
    delivered: 0,
    opened: 0,
    replied: 0,
    created_at: "2025-11-30T09:00:00Z",
  },
];

/* ─────────────────────────────────────────────────────────
   Modal state machine
   ───────────────────────────────────────────────────────── */

type Step = "compose" | "audience" | "review" | "sending" | "done";

interface ModalState {
  open: boolean;
  step: Step;
  name: string;
  message: string;
  segment: string;
  scheduleType: "now" | "later";
  scheduleDate: string;
  scheduleTime: string;
  sending: boolean;
  error: string | null;
}

type ModalAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET"; field: keyof ModalState; value: string | boolean }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "START_SEND" }
  | { type: "DONE" }
  | { type: "ERROR"; message: string };

const STEPS: Step[] = ["compose", "audience", "review", "sending", "done"];

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN":
      return { ...initialModal, open: true };
    case "CLOSE":
      return { ...state, open: false };
    case "SET":
      return { ...state, [action.field]: action.value };
    case "NEXT_STEP": {
      const idx = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.min(idx + 1, STEPS.length - 1)] };
    }
    case "PREV_STEP": {
      const idx = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.max(idx - 1, 0)] };
    }
    case "START_SEND":
      return { ...state, step: "sending", sending: true };
    case "DONE":
      return { ...state, step: "done", sending: false };
    case "ERROR":
      return { ...state, sending: false, error: action.message };
    default:
      return state;
  }
}

const initialModal: ModalState = {
  open: false,
  step: "compose",
  name: "",
  message: "",
  segment: "all",
  scheduleType: "now",
  scheduleDate: "",
  scheduleTime: "",
  sending: false,
  error: null,
};

/* ─────────────────────────────────────────────────────────
   Segment options
   ───────────────────────────────────────────────────────── */

const SEGMENTS = [
  { value: "all",       label: "All customers",          count: "2,148" },
  { value: "at_risk",   label: "At-risk (60-day inactive)", count: "324" },
  { value: "vip",       label: "VIP (top 10% spenders)",  count: "215" },
  { value: "cart",      label: "Abandoned cart (7 days)", count: "487" },
  { value: "cod",       label: "COD buyers",             count: "1,021" },
  { value: "repeat",    label: "Repeat buyers",           count: "842" },
];

/* ─────────────────────────────────────────────────────────
   Stat card
   ───────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "#25D366",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="dash-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="dash-label">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-white font-semibold" style={{ fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Status badge
   ───────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: BroadcastStatus }) {
  const meta = broadcastStatusMeta[status];
  return (
    <span
      className="dash-badge"
      style={{
        background: meta.color.bg,
        color: meta.color.text,
        border: `1px solid ${meta.color.border}`,
      }}
    >
      {status === "sending" && <Loader2 size={10} className="animate-spin" />}
      {status === "sent" && <CheckCircle2 size={10} />}
      {status === "scheduled" && <Clock size={10} />}
      {status === "failed" && <AlertCircle size={10} />}
      {meta.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Broadcast row
   ───────────────────────────────────────────────────────── */

function BroadcastRow({
  b,
  onClick,
}: {
  b: Broadcast;
  onClick: () => void;
}) {
  const deliveryRate =
    b.total_recipients > 0
      ? Math.round((b.delivered / b.total_recipients) * 100)
      : 0;
  const openRate =
    b.delivered > 0 ? Math.round((b.opened / b.delivered) * 100) : 0;

  return (
    <tr
      className="border-b cursor-pointer group transition-colors"
      style={{ borderColor: "#1E1E1E" }}
      onClick={onClick}
    >
      <td className="px-5 py-4">
        <p className="text-white font-medium" style={{ fontSize: 14 }}>{b.name}</p>
        <p
          className="mt-0.5 line-clamp-1"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", maxWidth: 340 }}
        >
          {b.message}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={b.status} />
      </td>
      <td className="px-5 py-4">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{b.segment}</p>
      </td>
      <td className="px-5 py-4 text-right">
        <p className="text-white font-medium" style={{ fontSize: 14 }}>
          {b.total_recipients > 0 ? b.total_recipients.toLocaleString() : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize: 13, color: b.status === "sent" ? "#25D366" : "rgba(255,255,255,0.3)" }}>
          {b.status === "sent" ? `${deliveryRate}%` : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize: 13, color: b.status === "sent" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
          {b.status === "sent" ? `${openRate}%` : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          {b.sent_at
            ? new Date(b.sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : b.scheduled_at
            ? `Sched. ${new Date(b.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
            : "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <ChevronRight
          size={14}
          style={{ color: "rgba(255,255,255,0.2)" }}
          className="inline group-hover:text-white transition-colors"
        />
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────
   Message preview helper
   ───────────────────────────────────────────────────────── */

function MessagePreview({ message }: { message: string }) {
  const display = message
    .replace("{{name}}", "Priya")
    .replace("{{link}}", "tellero.in/s/abc123");

  return (
    <div
      className="p-4 rounded-xl flex flex-col items-end gap-2"
      style={{ background: "#075E54", minHeight: 120 }}
    >
      <p
        className="text-xs font-semibold self-start"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        Preview
      </p>
      {message ? (
        <div className="whatsapp-bubble self-end" style={{ fontSize: 13 }}>
          {display}
          <div className="flex items-center gap-1 mt-1.5 justify-end">
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span style={{ color: "#53BDEB", fontSize: 11 }}>✓✓</span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Your message will appear here…
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Step indicator
   ───────────────────────────────────────────────────────── */

function StepDots({ step }: { step: Step }) {
  const visible: Step[] = ["compose", "audience", "review"];
  const idx = visible.indexOf(step);
  if (idx < 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {visible.map((s, i) => (
        <div
          key={s}
          className="rounded-full transition-all"
          style={{
            width: i === idx ? 20 : 6,
            height: 6,
            background: i <= idx ? "#25D366" : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Create Broadcast Modal
   ───────────────────────────────────────────────────────── */

function CreateModal({
  state,
  dispatch,
  onCreated,
}: {
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
  onCreated: (b: Broadcast) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) dispatch({ type: "CLOSE" });
  }

  // Fake send
  async function handleSend() {
    dispatch({ type: "START_SEND" });
    await new Promise((r) => setTimeout(r, 2200));
    const seg = SEGMENTS.find((s) => s.value === state.segment);
    const newB: Broadcast = {
      id: Date.now().toString(),
      name: state.name || "Untitled broadcast",
      message: state.message,
      segment: seg?.label ?? "All customers",
      status: state.scheduleType === "later" ? "scheduled" : "sent",
      scheduled_at:
        state.scheduleType === "later"
          ? `${state.scheduleDate}T${state.scheduleTime}:00Z`
          : null,
      sent_at: state.scheduleType === "now" ? new Date().toISOString() : null,
      total_recipients: parseInt((seg?.count ?? "0").replace(",", ""), 10),
      delivered: state.scheduleType === "now" ? parseInt((seg?.count ?? "0").replace(",", ""), 10) - Math.floor(Math.random() * 30) : 0,
      opened: 0,
      replied: 0,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: "DONE" });
    onCreated(newB);
  }

  if (!state.open) return null;

  const seg = SEGMENTS.find((s) => s.value === state.segment);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth: 740,
          maxHeight: "90vh",
          background: "#111111",
          border: "1px solid #2A2A2A",
          margin: "0 16px",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.2)" }}
            >
              <Megaphone size={13} style={{ color: "#25D366" }} />
            </div>
            <p className="text-white font-semibold" style={{ fontSize: 15 }}>
              {state.step === "done" ? "Broadcast sent!" : "New broadcast"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StepDots step={state.step} />
            <button
              onClick={() => dispatch({ type: "CLOSE" })}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "rgba(255,255,255,0.35)", background: "#1A1A1A" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Compose ── */}
          {state.step === "compose" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: form */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="dash-label">Broadcast name</label>
                  <input
                    className="dash-input"
                    placeholder="e.g. Diwali flash sale"
                    value={state.name}
                    onChange={(e) =>
                      dispatch({ type: "SET", field: "name", value: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="dash-label">Message</label>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                      Use {"{{name}}"} and {"{{link}}"}
                    </span>
                  </div>
                  <textarea
                    className="dash-textarea"
                    rows={6}
                    placeholder="Hi {{name}} 👋 We have something special for you…"
                    value={state.message}
                    onChange={(e) =>
                      dispatch({ type: "SET", field: "message", value: e.target.value })
                    }
                  />
                  <div className="flex justify-end">
                    <span style={{ fontSize: 11, color: state.message.length > 1000 ? "#EF4444" : "rgba(255,255,255,0.25)" }}>
                      {state.message.length}/1000
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: live preview */}
              <div className="flex flex-col gap-3">
                <p className="dash-label">Live preview</p>
                <MessagePreview message={state.message} />
                <div
                  className="p-3 rounded-xl flex flex-col gap-2"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                >
                  <p className="dash-label">Tips</p>
                  {[
                    "Keep messages under 160 chars for best delivery",
                    "Emojis boost open rates by ~18%",
                    "Always include your brand name",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-2">
                      <span style={{ color: "#25D366", fontSize: 11, marginTop: 2 }}>✓</span>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Audience ── */}
          {state.step === "audience" && (
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="dash-label">Choose segment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SEGMENTS.map((seg) => (
                    <button
                      key={seg.value}
                      onClick={() =>
                        dispatch({ type: "SET", field: "segment", value: seg.value })
                      }
                      className="flex items-center justify-between p-4 rounded-xl transition-all text-left"
                      style={{
                        background: state.segment === seg.value ? "rgba(37,211,102,0.08)" : "#1A1A1A",
                        border: `1px solid ${state.segment === seg.value ? "rgba(37,211,102,0.35)" : "#2A2A2A"}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                          style={{
                            borderColor: state.segment === seg.value ? "#25D366" : "#3A3A3A",
                            background: state.segment === seg.value ? "#25D366" : "transparent",
                          }}
                        />
                        <span style={{ fontSize: 14, color: state.segment === seg.value ? "#fff" : "rgba(255,255,255,0.6)" }}>
                          {seg.label}
                        </span>
                      </div>
                      <span
                        className="dash-badge"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: 11,
                        }}
                      >
                        {seg.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="flex flex-col gap-3">
                <p className="dash-label">Send time</p>
                <div className="flex gap-2">
                  {(["now", "later"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => dispatch({ type: "SET", field: "scheduleType", value: t })}
                      className="flex-1 py-3 rounded-xl font-medium transition-all"
                      style={{
                        fontSize: 14,
                        background: state.scheduleType === t ? "rgba(37,211,102,0.1)" : "#1A1A1A",
                        border: `1px solid ${state.scheduleType === t ? "rgba(37,211,102,0.35)" : "#2A2A2A"}`,
                        color: state.scheduleType === t ? "#25D366" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {t === "now" ? "Send now" : "Schedule"}
                    </button>
                  ))}
                </div>

                {state.scheduleType === "later" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="dash-label">Date</label>
                      <input
                        type="date"
                        className="dash-input"
                        value={state.scheduleDate}
                        onChange={(e) =>
                          dispatch({ type: "SET", field: "scheduleDate", value: e.target.value })
                        }
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="dash-label">Time</label>
                      <input
                        type="time"
                        className="dash-input"
                        value={state.scheduleTime}
                        onChange={(e) =>
                          dispatch({ type: "SET", field: "scheduleTime", value: e.target.value })
                        }
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {state.step === "review" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary */}
              <div className="flex flex-col gap-4">
                <p className="dash-label">Review before sending</p>
                {[
                  { label: "Name", value: state.name || "Untitled" },
                  { label: "Segment", value: seg?.label ?? "—" },
                  { label: "Recipients", value: seg?.count ?? "—" },
                  {
                    label: "Send time",
                    value:
                      state.scheduleType === "now"
                        ? "Immediately"
                        : `${state.scheduleDate} at ${state.scheduleTime}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid #1E1E1E" }}
                  >
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
                    <span className="text-white font-medium" style={{ fontSize: 14 }}>{item.value}</span>
                  </div>
                ))}

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
                >
                  <p style={{ fontSize: 13, color: "#FBBF24" }}>
                    ⚠️ WhatsApp broadcast is irreversible once sent. Please double-check your message and audience.
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="flex flex-col gap-3">
                <p className="dash-label">Message preview</p>
                <MessagePreview message={state.message} />
              </div>
            </div>
          )}

          {/* ── Step 4: Sending ── */}
          {state.step === "sending" && (
            <div className="p-12 flex flex-col items-center justify-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(37,211,102,0.1)", border: "2px solid rgba(37,211,102,0.25)" }}
              >
                <Loader2 size={28} style={{ color: "#25D366" }} className="animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold" style={{ fontSize: 18 }}>Sending broadcast…</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Queuing messages to {seg?.count} recipients
                </p>
              </div>
            </div>
          )}

          {/* ── Step 5: Done ── */}
          {state.step === "done" && (
            <div className="p-12 flex flex-col items-center justify-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(37,211,102,0.12)", border: "2px solid rgba(37,211,102,0.3)" }}
              >
                <CheckCircle2 size={28} style={{ color: "#25D366" }} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold" style={{ fontSize: 18 }}>
                  {state.scheduleType === "now" ? "Broadcast sent!" : "Broadcast scheduled!"}
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {state.scheduleType === "now"
                    ? `Messages are being delivered to ${seg?.count} customers.`
                    : `Scheduled for ${state.scheduleDate} at ${state.scheduleTime}.`}
                </p>
              </div>
              <button
                className="dash-btn-secondary"
                onClick={() => dispatch({ type: "CLOSE" })}
              >
                Back to broadcasts
              </button>
            </div>
          )}
        </div>

        {/* Modal footer */}
        {state.step !== "sending" && state.step !== "done" && (
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid #1E1E1E" }}
          >
            {state.step !== "compose" ? (
              <button
                className="dash-btn-ghost"
                onClick={() => dispatch({ type: "PREV_STEP" })}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {state.step === "review" ? (
              <button className="dash-btn-primary" onClick={handleSend}>
                <Send size={14} />
                {state.scheduleType === "now" ? "Send now" : "Schedule broadcast"}
              </button>
            ) : (
              <button
                className="dash-btn-primary"
                onClick={() => dispatch({ type: "NEXT_STEP" })}
                disabled={state.step === "compose" && (!state.name || !state.message)}
              >
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────── */

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(SEED);
  const [modal, dispatch] = useReducer(modalReducer, initialModal);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleCreated(b: Broadcast) {
    setBroadcasts((prev) => [b, ...prev]);
    // Close modal after showing "done" for 1.5s
    setTimeout(() => dispatch({ type: "CLOSE" }), 2000);
  }

  // Stats
  const totalSent = broadcasts.filter((b) => b.status === "sent").length;
  const totalRecipients = broadcasts.reduce((a, b) => a + b.total_recipients, 0);
  const avgOpen =
    broadcasts.filter((b) => b.status === "sent" && b.delivered > 0).length > 0
      ? Math.round(
          broadcasts
            .filter((b) => b.status === "sent" && b.delivered > 0)
            .reduce((a, b) => a + b.opened / b.delivered, 0) /
            broadcasts.filter((b) => b.status === "sent" && b.delivered > 0).length *
            100
        )
      : 0;

  return (
    <>
      <Header
        title="Broadcasts"
        subtitle="Send WhatsApp campaigns to your customer segments"
        actions={
          <button
            className="dash-btn-primary"
            onClick={() => dispatch({ type: "OPEN" })}
          >
            <Plus size={15} />
            New broadcast
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: "#0A0A0A" }}>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total broadcasts"
            value={broadcasts.length.toString()}
            sub={`${totalSent} sent`}
            icon={Megaphone}
            color="#25D366"
          />
          <StatCard
            label="Total recipients"
            value={totalRecipients.toLocaleString("en-IN")}
            sub="across all campaigns"
            icon={Users}
            color="#818CF8"
          />
          <StatCard
            label="Avg. open rate"
            value={`${avgOpen}%`}
            sub="WhatsApp avg. is 72%"
            icon={Eye}
            color="#FBBF24"
          />
          <StatCard
            label="Revenue generated"
            value="₹84,000"
            sub="this month · tracked"
            icon={TrendingUp}
            color="#25D366"
          />
        </div>

        {/* Table */}
        <div className="dash-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #1E1E1E" }}
          >
            <p className="text-white font-semibold" style={{ fontSize: 14 }}>
              All broadcasts
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              {broadcasts.length} total
            </p>
          </div>

          {broadcasts.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.15)" }}
              >
                <MessageSquare size={22} style={{ color: "#25D366" }} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold" style={{ fontSize: 16 }}>No broadcasts yet</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Send your first WhatsApp campaign to start seeing results.
                </p>
              </div>
              <button
                className="dash-btn-primary mt-2"
                onClick={() => dispatch({ type: "OPEN" })}
              >
                <Plus size={15} />
                Create broadcast
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E1E1E" }}>
                    {["Broadcast", "Status", "Segment", "Recipients", "Delivered", "Opened", "Date", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-5 py-3 ${h === "" || h === "Recipients" || h === "Delivered" || h === "Opened" || h === "Date" ? "text-right" : "text-left"}`}
                          style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((b) => (
                    <BroadcastRow
                      key={b.id}
                      b={b}
                      onClick={() => setSelectedId(b.id)}
                    />
                  ))}
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
