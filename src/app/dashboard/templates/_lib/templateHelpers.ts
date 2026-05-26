/** Extract all {{N}} variable placeholders from a string */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\d+)\}\}/g) ?? [];
  const unique = Array.from(new Set(matches));
  return unique.sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""));
    const nb = parseInt(b.replace(/\D/g, ""));
    return na - nb;
  });
}

/** Replace {{N}} with actual values for preview */
export function interpolateVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[n] ?? `{{${n}}}`);
}

/** Insert text at a textarea cursor position */
export function insertAtCursor(
  el: HTMLTextAreaElement,
  insertion: string
): string {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  return el.value.slice(0, start) + insertion + el.value.slice(end);
}

/** Get the next variable number to insert */
export function nextVariableIndex(text: string): number {
  const nums = (text.match(/\{\{(\d+)\}\}/g) ?? [])
    .map((m) => parseInt(m.replace(/\D/g, "")));
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

/** Format a date as relative time ("3 days ago") */
export function relativeTime(date: string | null): string {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return "just now";
}

/** Language display name */
export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  "en-hinglish": "Hinglish",
};

export const LANGUAGES = [
  { value: "en",          label: "English (en)" },
  { value: "hi",          label: "Hindi (hi)"   },
  { value: "en-hinglish", label: "Hinglish"     },
];

export const CATEGORIES = [
  {
    value: "MARKETING",
    label: "Marketing",
    description: "Promotions, offers, launches",
  },
  {
    value: "UTILITY",
    label: "Utility",
    description: "Order updates, shipping, receipts",
  },
  {
    value: "AUTHENTICATION",
    label: "Authentication",
    description: "OTPs and verification",
  },
] as const;

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateStatus   = "draft" | "pending" | "approved" | "rejected" | "paused";
export type HeaderType       = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
export type ButtonType       = "CALL_TO_ACTION" | "QUICK_REPLY";

export interface ButtonItem {
  id:      string;
  subtype: "PHONE_NUMBER" | "URL" | "QUICK_REPLY";
  text:    string;
  value:   string; // url or phone or empty for quick-reply
}

export interface Template {
  id:               string;
  name:             string;
  category:         TemplateCategory;
  language:         string;
  components:       unknown[];
  variable_labels:  Record<string, string>;
  meta_template_id: string | null;
  status:           TemplateStatus;
  rejection_reason: string | null;
  submitted_at:     string | null;
  approved_at:      string | null;
  created_at:       string;
  updated_at:       string;
  // derived — populated client-side from components
  body?:   string;
  header?: { type: HeaderType; text?: string };
  footer?: string;
  buttons?: ButtonItem[];
}
