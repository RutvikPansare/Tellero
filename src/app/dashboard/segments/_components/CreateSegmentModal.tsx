"use client";

import { useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { SegmentBuilder }  from "./SegmentBuilder";
import { SegmentPreview }  from "./SegmentPreview";
import { useCreateSegment } from "../_hooks/useCreateSegment";
import { useSegmentPreview } from "../_hooks/useSegmentPreview";
import { useContactTags }    from "@/app/dashboard/contacts/_hooks/useContactTags";
import type { Segment } from "@/types/segments";

interface Props {
  open:           boolean;
  editingSegment: Segment | null;
  onClose:        () => void;
  onSuccess:      () => void;
}

export function CreateSegmentModal({ open, editingSegment, onClose, onSuccess }: Props) {
  const { allTags } = useContactTags();

  const {
    state, dispatch, addFilter, handleSave, reset, loadSegment,
  } = useCreateSegment(() => { onSuccess(); onClose(); });

  const {
    count, sampleContacts, estimatedCost, loading: previewLoading,
  } = useSegmentPreview(state.filters, state.conjunction);

  /* Load editing segment on open */
  useEffect(() => {
    if (open && editingSegment) loadSegment(editingSegment);
    else if (open)              reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingSegment]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function handleClose() { reset(); onClose(); }

  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         200,
        background:     "rgba(26,20,17,0.45)",
        backdropFilter: "blur(3px)",
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "center",
        padding:        "40px 24px",
        overflowY:      "auto",
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background:   "white",
        borderRadius: 18,
        boxShadow:    "0 24px 64px rgba(0,0,0,0.2)",
        width:        "100%",
        maxWidth:     860,
        display:      "flex",
        flexDirection:"column",
      }}>

        {/* ── Modal header ────────────────────────────────────── */}
        <div style={{
          padding:      "18px 24px",
          borderBottom: "1px solid var(--border)",
          display:      "flex",
          alignItems:   "center",
          justifyContent:"space-between",
          flexShrink:   0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>
              {editingSegment ? "Edit segment" : "New segment"}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Define filter conditions to group your contacts
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background:"transparent", border:"none", cursor:"pointer", padding:6, borderRadius:8, color:"var(--text-muted)", display:"flex" }}
            onMouseOver={e=>(e.currentTarget.style.background="var(--cream-2)")}
            onMouseOut={e =>(e.currentTarget.style.background="transparent")}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Two-column body ──────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left — builder */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", borderRight: "1px solid var(--border)" }}>
            <SegmentBuilder
              name={state.name}
              description={state.description}
              filters={state.filters}
              conjunction={state.conjunction}
              errors={state.errors}
              allTags={allTags}
              onSetName={v  => dispatch({ type: "SET_NAME",        payload: v })}
              onSetDesc={v  => dispatch({ type: "SET_DESCRIPTION", payload: v })}
              onSetConj={v  => dispatch({ type: "SET_CONJUNCTION", payload: v })}
              onAddFilter={addFilter}
              onUpdateFilter={(id, changes) => dispatch({ type: "UPDATE_FILTER", payload: { id, changes } })}
              onRemoveFilter={id => dispatch({ type: "REMOVE_FILTER", payload: id })}
            />
          </div>

          {/* Right — preview */}
          <div style={{ width: 280, flexShrink: 0, padding: "24px", background: "var(--cream)", overflowY: "auto" }}>
            <SegmentPreview
              count={count}
              sampleContacts={sampleContacts}
              estimatedCost={estimatedCost}
              loading={previewLoading}
            />
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        {state.errors.submit && (
          <div style={{ padding: "0 24px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#DC2626", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, padding: "8px 12px" }}>
              {state.errors.submit}
            </p>
          </div>
        )}

        <div style={{
          padding:      "14px 24px",
          borderTop:    "1px solid var(--border)",
          display:      "flex",
          alignItems:   "center",
          justifyContent:"space-between",
          flexShrink:   0,
        }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: "1.5px solid var(--border)", background: "white",
              color: "var(--text-dark)", cursor: "pointer",
            }}
            onMouseOver={e=>(e.currentTarget.style.borderColor="var(--text-mid)")}
            onMouseOut={e =>(e.currentTarget.style.borderColor="var(--border)")}>
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave(count, editingSegment)}
            disabled={state.isSubmitting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              border: "none", background: "var(--burgundy)", color: "white",
              cursor: state.isSubmitting ? "not-allowed" : "pointer",
              opacity: state.isSubmitting ? 0.7 : 1,
            }}
            onMouseOver={e=>{ if (!state.isSubmitting) e.currentTarget.style.opacity="0.85"; }}
            onMouseOut={e =>{ if (!state.isSubmitting) e.currentTarget.style.opacity="1"; }}>
            {state.isSubmitting
              ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Saving…</>
              : <><Save size={14} /> {editingSegment ? "Save changes" : "Create segment"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
