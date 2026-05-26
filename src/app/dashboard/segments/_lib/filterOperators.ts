import type { FilterFieldGroup } from "@/types/segments";

export const FILTER_FIELDS: FilterFieldGroup[] = [
  {
    group: "Tags",
    fields: [
      { value: "tag",     label: "Has tag",             valueType: "tag" },
      { value: "not_tag", label: "Does not have tag",   valueType: "tag" },
    ],
  },
  {
    group: "Orders",
    fields: [
      { value: "total_orders",   label: "Total orders",       valueType: "number"   },
      { value: "total_spent",    label: "Total spend (₹)",    valueType: "currency" },
      { value: "last_order_at",  label: "Last order date",    valueType: "date"     },
      { value: "first_order_at", label: "First order date",   valueType: "date"     },
    ],
  },
  {
    group: "Attributes",
    fields: [
      { value: "attribute", label: "Custom attribute", valueType: "attribute" },
    ],
  },
];

export const OPERATORS_BY_TYPE = {
  tag: [
    { value: "is",     label: "is"     },
    { value: "is_not", label: "is not" },
  ],
  number: [
    { value: "equals", label: "="  },
    { value: "gt",     label: ">"  },
    { value: "lt",     label: "<"  },
    { value: "gte",    label: ">=" },
    { value: "lte",    label: "<=" },
  ],
  currency: [
    { value: "gt",  label: "more than ₹" },
    { value: "lt",  label: "less than ₹" },
    { value: "gte", label: "at least ₹"  },
  ],
  date: [
    { value: "within_days",       label: "within last X days"   },
    { value: "more_than_days_ago",label: "more than X days ago" },
    { value: "before",            label: "before"               },
    { value: "after",             label: "after"                },
  ],
  attribute: [
    { value: "equals",   label: "equals"   },
    { value: "contains", label: "contains" },
  ],
} as const;

export const TAG_COLORS = [
  "#25D366", // green
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
] as const;

/** Convert hex color + alpha to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
