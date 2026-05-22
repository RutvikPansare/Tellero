import { CheckCircle2, Clock, XCircle, PenLine } from "lucide-react";
import type { TemplateStatus } from "../_lib/templateHelpers";

const CONFIG: Record<TemplateStatus, {
  label: string;
  icon:  React.ElementType;
  bg:    string;
  text:  string;
  border:string;
}> = {
  approved: { label:"Approved",  icon:CheckCircle2, bg:"rgba(37,211,102,0.1)",  text:"#15803D",         border:"rgba(37,211,102,0.25)" },
  pending:  { label:"In Review", icon:Clock,         bg:"rgba(251,191,36,0.1)", text:"#B45309",         border:"rgba(251,191,36,0.3)"  },
  rejected: { label:"Rejected",  icon:XCircle,       bg:"rgba(239,68,68,0.08)", text:"#DC2626",         border:"rgba(239,68,68,0.2)"   },
  draft:    { label:"Draft",     icon:PenLine,       bg:"rgba(26,20,17,0.05)", text:"var(--text-muted)",border:"var(--border)"          },
  paused:   { label:"Paused",    icon:Clock,         bg:"rgba(99,102,241,0.08)",text:"#6366F1",         border:"rgba(99,102,241,0.2)"  },
};

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const c = CONFIG[status] ?? CONFIG.draft;
  const Icon = c.icon;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600,
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      fontFamily:"var(--font-dm-sans,'DM Sans',sans-serif)",
    }}>
      <Icon size={10} />
      {c.label}
    </span>
  );
}
