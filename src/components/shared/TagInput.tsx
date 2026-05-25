"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { TagBadge } from "./TagBadge";
import { TAG_COLORS } from "@/app/dashboard/segments/_lib/filterOperators";
import type { Tag } from "@/types/segments";

interface Props {
  selectedTags:  Tag[];
  availableTags: Tag[];
  onAdd:         (tag: Tag) => void;
  onRemove:      (tagId: string) => void;
  onCreateNew:   (name: string, color: string) => Promise<Tag>;
  placeholder?:  string;
  loading?:      boolean;
}

export function TagInput({
  selectedTags, availableTags, onAdd, onRemove, onCreateNew,
  placeholder = "Add tag…", loading,
}: Props) {
  const [query,       setQuery]       = useState("");
  const [open,        setOpen]        = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [newColor,    setNewColor]    = useState<string>(TAG_COLORS[0]);
  const [pickerOpen,  setPickerOpen]  = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false); setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selectedIds = new Set(selectedTags.map(t => t.id));
  const filtered    = availableTags.filter(
    t => !selectedIds.has(t.id) &&
         t.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch  = availableTags.some(
    t => t.name.toLowerCase() === query.toLowerCase()
  );
  const showCreate  = query.trim().length > 0 && !exactMatch;

  async function handleCreate() {
    if (!query.trim()) return;
    setCreating(true);
    try {
      const tag = await onCreateNew(query.trim(), newColor);
      onAdd(tag);
      setQuery(""); setOpen(false); setPickerOpen(false);
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) { onAdd(filtered[0]); setQuery(""); }
      else if (showCreate) handleCreate();
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Pills + input row */}
      <div
        style={{
          display:     "flex",
          flexWrap:    "wrap",
          alignItems:  "center",
          gap:         6,
          padding:     "7px 10px",
          border:      "1.5px solid var(--border)",
          borderRadius:"var(--radius-btn)",
          background:  "white",
          cursor:      "text",
          minHeight:   40,
        }}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            name={tag.name}
            color={tag.color}
            size="sm"
            removable
            onRemove={() => onRemove(tag.id)}
          />
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          style={{
            border:     "none",
            outline:    "none",
            fontSize:   12,
            color:      "var(--text-dark)",
            background: "transparent",
            minWidth:   80,
            flex:       1,
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (filtered.length > 0 || showCreate) && (
        <div style={{
          position:   "absolute",
          top:        "calc(100% + 4px)",
          left:       0,
          right:      0,
          zIndex:     100,
          background: "white",
          border:     "1px solid var(--border)",
          borderRadius: 10,
          boxShadow:  "0 8px 24px rgba(0,0,0,0.1)",
          overflow:   "hidden",
          maxHeight:  200,
          overflowY:  "auto",
        }}>
          {filtered.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => { onAdd(tag); setQuery(""); }}
              style={{
                width:       "100%",
                display:     "flex",
                alignItems:  "center",
                justifyContent: "space-between",
                padding:     "8px 12px",
                border:      "none",
                background:  "transparent",
                cursor:      "pointer",
                textAlign:   "left",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "var(--cream)")}
              onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
            >
              <TagBadge name={tag.name} color={tag.color} size="sm" />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {tag.contact_count}
              </span>
            </button>
          ))}

          {showCreate && (
            <div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                style={{
                  width:       "100%",
                  display:     "flex",
                  alignItems:  "center",
                  gap:         8,
                  padding:     "8px 12px",
                  border:      "none",
                  borderTop:   filtered.length > 0 ? "1px solid var(--border)" : "none",
                  background:  "transparent",
                  cursor:      creating ? "not-allowed" : "pointer",
                  fontSize:    12,
                  color:       "var(--text-dark)",
                  fontWeight:  600,
                }}
                onMouseOver={e => (e.currentTarget.style.background = "var(--cream)")}
                onMouseOut={e  => (e.currentTarget.style.background = "transparent")}
              >
                <Plus size={11} />
                {creating ? "Creating…" : `Create "${query.trim()}"`}

                {/* Color dot indicator */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setPickerOpen(v => !v); }}
                  style={{
                    marginLeft:   "auto",
                    width:        16,
                    height:       16,
                    borderRadius: "50%",
                    background:   newColor,
                    border:       "2px solid white",
                    outline:      "2px solid var(--border)",
                    cursor:       "pointer",
                    flexShrink:   0,
                  }}
                />
              </button>

              {/* Color picker */}
              {pickerOpen && (
                <div style={{ display: "flex", gap: 6, padding: "6px 12px 10px", flexWrap: "wrap" }}>
                  {TAG_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setNewColor(c); setPickerOpen(false); }}
                      style={{
                        width:        20,
                        height:       20,
                        borderRadius: "50%",
                        background:   c,
                        border:       newColor === c ? "2px solid var(--text-dark)" : "2px solid transparent",
                        cursor:       "pointer",
                        outline:      "none",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
