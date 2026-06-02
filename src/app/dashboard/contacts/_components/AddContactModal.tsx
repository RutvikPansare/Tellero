"use client";

import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── shared input style ─────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid var(--border)", background: "white",
  fontSize: 13, color: "var(--text-dark)", outline: "none",
  width: "100%", boxSizing: "border-box",
  fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text-dark)",
  textTransform: "uppercase", letterSpacing: "0.08em",
};

interface Field {
  label: string;
  key:   "name" | "phone" | "email";
  placeholder: string;
  required: boolean;
  type: string;
  hint?: string;
}

const FIELDS: Field[] = [
  {
    label: "Phone number",
    key: "phone",
    placeholder: "+91 98765 43210",
    required: true,
    type: "tel",
    hint: "International format preferred (e.g. +919876543210)",
  },
  {
    label: "Full name",
    key: "name",
    placeholder: "Priya Sharma",
    required: false,
    type: "text",
  },
  {
    label: "Email address",
    key: "email",
    placeholder: "priya@example.com",
    required: false,
    type: "email",
  },
];

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

export function AddContactModal({ onClose, onSuccess }: Props) {
  const [form,    setForm]    = useState({ name: "", phone: "", email: "" });
  const [errors,  setErrors]  = useState<Partial<Record<"name" | "phone" | "email" | "submit", string>>>({});
  const [saving,  setSaving]  = useState(false);

  function setField(key: "name" | "phone" | "email", value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    const phone = form.phone.trim();
    if (!phone) {
      e.phone = "Phone number is required";
    } else if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s\-()]/g, ""))) {
      e.phone = "Enter a valid phone number";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address";
    }
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Normalise phone: strip spaces/dashes, ensure leading +
      const rawPhone = form.phone.trim().replace(/[\s\-()]/g, "");
      const phone    = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;

      const { error: dbErr } = await (supabase as any)
        .from("contacts")
        .upsert(
          {
            user_id: user.id,
            phone,
            name:    form.name.trim()  || null,
            email:   form.email.trim() || null,
          },
          { onConflict: "user_id,phone", ignoreDuplicates: false }
        );

      if (dbErr) throw new Error(dbErr.message);

      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 49,
          background: "rgba(26,20,17,0.45)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px 16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "white", borderRadius: 18,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            width: "100%", maxWidth: 440,
            pointerEvents: "auto",
            overflow: "hidden",
          }}
          onClick={e => e.stopPropagation()}
        >

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px 16px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(56,0,8,0.07)",
                border: "1px solid rgba(56,0,8,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <UserPlus size={15} style={{ color: "var(--burgundy)" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>
                  Add contact
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                  Add a single contact manually
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 6, borderRadius: 8, color: "var(--text-muted)",
                display: "flex",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "var(--cream-2)"; }}
              onMouseOut={e  => { e.currentTarget.style.background = "transparent"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Form body */}
          <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
            {FIELDS.map(f => (
              <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>
                  {f.label}
                  {f.required && <span style={{ color: "#DC2626", marginLeft: 3 }}>*</span>}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setField(f.key, e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                  style={{
                    ...inputStyle,
                    borderColor: errors[f.key] ? "#DC2626" : "var(--border)",
                  }}
                  onFocus={e  => (e.currentTarget.style.borderColor = errors[f.key] ? "#DC2626" : "var(--text-dark)")}
                  onBlur={e   => (e.currentTarget.style.borderColor = errors[f.key] ? "#DC2626" : "var(--border)")}
                />
                {f.hint && !errors[f.key] && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{f.hint}</p>
                )}
                {errors[f.key] && (
                  <p style={{ margin: 0, fontSize: 12, color: "#DC2626" }}>{errors[f.key]}</p>
                )}
              </div>
            ))}

            {errors.submit && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <p style={{ margin: 0, fontSize: 12, color: "#DC2626" }}>{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "20px",
            display: "flex", gap: 10, justifyContent: "flex-end",
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px", borderRadius: 8, cursor: "pointer",
                border: "1.5px solid var(--border)", background: "white",
                fontSize: 13, fontWeight: 600, color: "var(--text-dark)",
                transition: "border-color 0.15s",
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = "var(--text-mid)")}
              onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 20px", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
                border: "none", background: "var(--text-dark)", color: "white",
                fontSize: 13, fontWeight: 700,
                opacity: saving ? 0.7 : 1, transition: "opacity 0.15s",
              }}
              onMouseOver={e => { if (!saving) e.currentTarget.style.opacity = "0.85"; }}
              onMouseOut={e  => { if (!saving) e.currentTarget.style.opacity = "1"; }}
            >
              {saving
                ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                : <><UserPlus size={13} /> Save contact</>
              }
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
