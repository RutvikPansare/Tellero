/**
 * segmentQueryBuilder.ts
 * ──────────────────────
 * Converts a FilterCondition[] into a Supabase PostgREST query on `contacts`.
 *
 * Filter types:
 *  • tag        — !inner join contact_tags; correctly returns only contacts with the tag
 *  • not_tag    — two-step: fetch IDs with the tag, then exclude them (best accuracy)
 *  • total_orders   — integer comparison on contacts.total_orders
 *  • total_spent    — numeric comparison on contacts.total_spent
 *  • last_order_at  — date/relative-date comparison on contacts.last_order_at
 *  • first_order_at — date/relative-date comparison on contacts.first_order_at
 *  • attribute      — JSONB key/value filter using PostgREST arrow syntax
 *
 * Conjunction:
 *  • AND — each filter is chained as an additional .filter() call (default AND)
 *  • OR  — scalar filters combined via .or(); tag filters fall back to AND
 *
 * !inner note: when any "tag" (has-tag) filter is present we switch the
 * contact_tags join to !inner so PostgREST returns only contacts that have at
 * least one matching row — a plain LEFT JOIN would return all contacts regardless.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FilterCondition } from "@/types/segments";

function buildSelect(filters: FilterCondition[]): string {
  // Use !inner when we need to positively filter by tag so PostgREST only
  // returns contacts that actually have a matching contact_tags row.
  const needsInner = filters.some(f => f.field === "tag");
  const joinClause = needsInner
    ? "contact_tags!inner ( tag:tags ( id, name, color ) )"
    : "contact_tags ( tag:tags ( id, name, color ) )";
  return `id, name, phone, total_orders, total_spent, last_order_at, first_order_at, attributes, ${joinClause}`;
}

/** Build and execute a segment preview query. Returns { count, data }. */
export async function buildSegmentQuery(
  supabase:    SupabaseClient,
  userId:      string,
  filters:     FilterCondition[],
  conjunction: "AND" | "OR"
) {
  if (filters.length === 0) {
    return (supabase as any)
      .from("contacts")
      .select(buildSelect(filters), { count: "exact" })
      .eq("user_id", userId)
      .limit(100);
  }

  // ── not_tag pre-fetch ──────────────────────────────────────
  // PostgREST cannot express NOT EXISTS in a single query, so we resolve the
  // excluded contact_id set first and pass it as a NOT IN list.
  const notTagFilters = filters.filter(f => f.field === "not_tag");
  let excludedIds: string[] = [];
  if (notTagFilters.length > 0) {
    for (const f of notTagFilters) {
      const { data } = await (supabase as any)
        .from("contact_tags")
        .select("contact_id")
        .eq("tag_id", f.value as string);
      if (data) excludedIds = [...excludedIds, ...(data as { contact_id: string }[]).map(r => r.contact_id)];
    }
  }

  let query = (supabase as any)
    .from("contacts")
    .select(buildSelect(filters), { count: "exact" })
    .eq("user_id", userId)
    .limit(100);

  // Exclude contacts that have any of the not_tag tags
  if (excludedIds.length > 0) {
    query = query.not("id", "in", `(${excludedIds.join(",")})`);
  }

  if (conjunction === "AND") {
    for (const filter of filters) {
      if (filter.field !== "not_tag") query = applyFilter(query, filter);
    }
  } else {
    // OR: build PostgREST or() string for scalar filters
    // tag filters must still be ANDed (PostgREST join limitation)
    const scalarConds: string[] = [];
    for (const filter of filters) {
      if (filter.field === "not_tag") continue; // already handled above
      const cond = buildScalarCondition(filter);
      if (cond) {
        scalarConds.push(cond);
      } else {
        query = applyFilter(query, filter);
      }
    }
    if (scalarConds.length > 0) {
      query = query.or(scalarConds.join(","));
    }
  }

  return query;
}

/** Apply a single filter to the query (AND mode). */
function applyFilter(query: any, filter: FilterCondition): any {
  switch (filter.field) {
    case "tag":
      // Has tag: the select already uses !inner join; filter on the nested column
      // so PostgREST returns only contacts with a matching contact_tags row.
      return query.eq("contact_tags.tag_id", filter.value as string);

    case "not_tag":
      // Handled via pre-fetch exclusion in buildSegmentQuery; skip here.
      return query;

    case "total_orders":
      return applyNumeric(query, "total_orders", filter);

    case "total_spent":
      return applyNumeric(query, "total_spent", filter);

    case "last_order_at":
      return applyDate(query, "last_order_at", filter);

    case "first_order_at":
      return applyDate(query, "first_order_at", filter);

    case "attribute": {
      // JSONB: attributes->>'key' operator value
      const [attrKey, attrVal] = filter.value as string[];
      if (!attrKey) return query;
      const col = `attributes->>${attrKey}`;
      if (filter.operator === "contains") {
        return query.ilike(col, `%${attrVal}%`);
      }
      return query.eq(col, attrVal ?? "");
    }

    default:
      return query;
  }
}

/** Build a scalar OR condition string for PostgREST .or(). */
function buildScalarCondition(filter: FilterCondition): string | null {
  switch (filter.field) {
    case "total_orders": return buildNumericCond("total_orders", filter);
    case "total_spent":  return buildNumericCond("total_spent",  filter);
    default:             return null; // tag/date/attribute don't work in .or()
  }
}

const NUMERIC_OP_MAP: Record<string, string> = {
  equals: "eq", gt: "gt", lt: "lt", gte: "gte", lte: "lte",
};

function applyNumeric(query: any, col: string, f: FilterCondition): any {
  const op = NUMERIC_OP_MAP[f.operator];
  if (!op) return query;
  return query.filter(col, op, f.value as number);
}

function buildNumericCond(col: string, f: FilterCondition): string | null {
  const op = NUMERIC_OP_MAP[f.operator];
  if (!op) return null;
  return `${col}.${op}.${f.value}`;
}

function applyDate(query: any, col: string, f: FilterCondition): any {
  const days  = f.value as number;
  const now   = new Date();

  switch (f.operator) {
    case "within_days": {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - days);
      return query.gte(col, cutoff.toISOString());
    }
    case "more_than_days_ago": {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - days);
      return query.lt(col, cutoff.toISOString());
    }
    case "before":
      return query.lt(col, f.value as string);
    case "after":
      return query.gt(col, f.value as string);
    default:
      return query;
  }
}
