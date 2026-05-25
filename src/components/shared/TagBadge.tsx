import { X } from "lucide-react";
import { hexToRgba } from "@/app/dashboard/segments/_lib/filterOperators";

interface Props {
  name:       string;
  color?:     string;
  size?:      "sm" | "md";
  removable?: boolean;
  onRemove?:  () => void;
}

export function TagBadge({ name, color = "#25D366", size = "md", removable, onRemove }: Props) {
  const bg     = hexToRgba(color, 0.15);
  const border = hexToRgba(color, 0.3);

  const padding  = size === "sm" ? "1px 6px"  : "3px 8px";
  const fontSize = size === "sm" ? 10          : 11;

  return (
    <span
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           4,
        padding,
        borderRadius:  99,
        fontSize,
        fontWeight:    600,
        background:    bg,
        color,
        border:        `1px solid ${border}`,
        whiteSpace:    "nowrap",
        fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}
    >
      {name}
      {removable && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove?.(); }}
          style={{
            background: "transparent",
            border:     "none",
            cursor:     "pointer",
            padding:    0,
            display:    "flex",
            alignItems: "center",
            color:      "inherit",
            opacity:    0.6,
            lineHeight: 1,
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "1")}
          onMouseOut={e  => (e.currentTarget.style.opacity = "0.6")}
        >
          <X size={size === "sm" ? 9 : 10} />
        </button>
      )}
    </span>
  );
}
