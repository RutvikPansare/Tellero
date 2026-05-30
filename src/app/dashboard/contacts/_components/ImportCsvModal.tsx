"use client";

import { useRef, useState } from "react";
import { X, Download, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  onClose:  () => void;
  onFile:   (file: File) => void;
}

const SAMPLE_ROWS = [
  ["phone",       "name",          "email",                  "total_orders", "total_spent"],
  ["+919876543210","Priya Sharma",  "priya@example.com",      "3",            "1500"],
  ["+918765432109","Rahul Mehta",   "rahul@example.com",      "1",            "499"],
  ["+917654321098","Anjali Singh",  "",                       "0",            "0"],
];

function downloadSample() {
  const csv  = SAMPLE_ROWS.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "tellero_contacts_sample.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function ImportCsvModal({ onClose, onFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") return;
    onFile(file);
    onClose();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const COLUMNS = [
    { name: "phone",         req: true,  desc: "10-digit or +91 format (e.g. 9876543210 or +919876543210)" },
    { name: "name",          req: false, desc: "Full name of the customer" },
    { name: "email",         req: false, desc: "Email address" },
    { name: "total_orders",  req: false, desc: "Number of orders placed" },
    { name: "total_spent",   req: false, desc: "Lifetime spend in ₹" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 49,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
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
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            width: "100%",
            maxWidth: 520,
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            overflow: "hidden",
            pointerEvents: "auto",
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
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(56,0,8,0.07)",
                border: "1px solid rgba(56,0,8,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={15} style={{ color: "var(--burgundy)" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>
                  Import Contacts
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                  Upload a CSV file to add or update contacts
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
              onMouseOver={e => { e.currentTarget.style.background = "var(--cream-3)"; e.currentTarget.style.color = "var(--text-dark)"; }}
              onMouseOut={e  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Column reference */}
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                CSV Column Reference
              </p>
              <div style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
              }}>
                {COLUMNS.map((col, i) => (
                  <div
                    key={col.name}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "9px 14px",
                      borderBottom: i < COLUMNS.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ paddingTop: 1 }}>
                      {col.req
                        ? <AlertCircle size={13} style={{ color: "var(--burgundy)" }} />
                        : <CheckCircle2 size={13} style={{ color: "#15803D" }} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <code style={{
                          fontSize: 12, fontWeight: 700,
                          background: "var(--cream-2)", color: "var(--text-dark)",
                          padding: "1px 6px", borderRadius: 5,
                          border: "1px solid var(--border)",
                        }}>
                          {col.name}
                        </code>
                        {col.req && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.06em", color: "var(--burgundy)",
                            background: "rgba(56,0,8,0.07)",
                            padding: "1px 6px", borderRadius: 99,
                            border: "1px solid rgba(56,0,8,0.12)",
                          }}>
                            Required
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                        {col.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                The first row must be a header row. Column order does not matter. Existing contacts are updated if the phone number matches.
              </p>
            </div>

            {/* Sample download */}
            <button
              type="button"
              onClick={downloadSample}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 10, width: "100%",
                border: "1.5px dashed var(--border)",
                background: "var(--cream-2)", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "var(--text-mid)",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = "var(--text-dark)";
                e.currentTarget.style.color = "var(--text-dark)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-mid)";
              }}
            >
              <Download size={14} />
              Download sample CSV
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                tellero_contacts_sample.csv
              </span>
            </button>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "var(--burgundy)" : "var(--border)"}`,
                borderRadius: 12,
                padding: "28px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                background: dragging ? "rgba(56,0,8,0.04)" : "white",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: dragging ? "rgba(56,0,8,0.08)" : "var(--cream-2)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Upload size={17} style={{ color: dragging ? "var(--burgundy)" : "var(--text-mid)" }} />
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>
                {dragging ? "Drop your CSV here" : "Click to browse or drag & drop"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                .csv files only
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
