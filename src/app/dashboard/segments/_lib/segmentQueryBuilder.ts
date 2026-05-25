/**
 * segmentQueryBuilder.ts
 * ──────────────────────
 * Converts a FilterCondition[] into a Supabase PostgREST query on `contacts`.
 *
 * Filter types:
 *  • tag / not_tag  — join contact_tags to find contacts that have (or lack) a tag
 *  • total_orders   — integer comparison on contacts.total_orders
 *  • total_spent    — numeric comparison on contacts.total_spent
 *  • last_order_at  — date/relative-date comparison on contacts.last_order_at
 *  • first_order_at — date/relative-date comparison on contacts.first_order_at
 *  • attribute      — JSONB key/value filter using PostgREST arrow syntax
 *
 * Conjunction:
 *  • AND — each filter is chained as an additional .filter() call (default Supabase AND)
 *  • OR  — filters are combined via a single .or() call with comma-separated conditions
 *
 * NOTE: tag/not_tag filters with OR conjunction are best-effort — Supabase doesn't
 * support OR across joined relationships natively, so they fall back to AND.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FilterCondition } from "@/types/segments";

const BASE_SELECT = `
  id, name, phone, total_orders, total_spent,
  last_order_at, first_order_at, attributes,
  contact_tags ( tag:tags ( id, name, color ) )
`.trim();

/** Build and execute a segment preview query. Returns { count, data }. */
export async function buildSegmentQuery(
  supabase:    SupabaseClient,
  userId:      string,
  filters:     FilterCondition[],
  conjunction: "AND" | "OR"
) {
  let query = (supabase as any)
    .from("contacts")
    .select(BASE_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .limit(100);

  if (filters.length === 0) return query;

  if (conjunction === "AND") {
    for (const filter of filters) {
      query = applyFilter(query, filter);
    }
  } else {
    // OR: build PostgREST or() string for scalar filters
    // tag/not_tag filters must still be ANDed (limitation of join filtering)
    const scalarConds: string[] = [];
    for (const filter of filters) {
      const cond = buildScalarCondition(filter);
      if (cond) {
        scalarConds.push(cond);
      } else {
        // tag filters always AND
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
      // Has tag: inner-join on contact_tags where tag_id matches
      return query.eq("contact_tags.tag_id", filter.value as string);

    case "not_tag":
      // Doesn't have tag: NOT inner-join — PostgREST neq on join
      return query.neq("contact_tags.tag_id", filter.value as string);

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
