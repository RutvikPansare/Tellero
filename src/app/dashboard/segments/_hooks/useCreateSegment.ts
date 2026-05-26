"use client";

import { useReducer, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateSegment } from "../_lib/segmentValidation";
import type { FilterCondition, Segment } from "@/types/segments";

/* ─── State ─────────────────────────────────────────────── */

interface State {
  name:         string;
  description:  string;
  filters:      FilterCondition[];
  conjunction:  "AND" | "OR";
  isSubmitting: boolean;
  errors:       Record<string, string>;
}

const initial: State = {
  name:         "",
  description:  "",
  filters:      [],
  conjunction:  "AND",
  isSubmitting: false,
  errors:       {},
};

/* ─── Actions ────────────────────────────────────────────── */

type Action =
  | { type: "SET_NAME";        payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_CONJUNCTION"; payload: "AND" | "OR" }
  | { type: "ADD_FILTER";      payload: FilterCondition }
  | { type: "UPDATE_FILTER";   payload: { id: string; changes: Partial<FilterCondition> } }
  | { type: "REMOVE_FILTER";   payload: string }
  | { type: "SET_ERRORS";      payload: Record<string, string> }
  | { type: "SET_SUBMITTING";  payload: boolean }
  | { type: "LOAD";            payload: Partial<State> }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_NAME":        return { ...state, name:        action.payload, errors: {} };
    case "SET_DESCRIPTION": return { ...state, description: action.payload };
    case "SET_CONJUNCTION": return { ...state, conjunction: action.payload };
    case "ADD_FILTER":
      return { ...state, filters: [...state.filters, action.payload], errors: {} };
    case "UPDATE_FILTER":
      return {
        ...state,
        filters: state.filters.map(f =>
          f.id === action.payload.id ? { ...f, ...action.payload.changes } : f
        ),
        errors: {},
      };
    case "REMOVE_FILTER":
      return { ...state, filters: state.filters.filter(f => f.id !== action.payload) };
    case "SET_ERRORS":     return { ...state, errors:       action.payload };
    case "SET_SUBMITTING": return { ...state, isSubmitting: action.payload };
    case "LOAD":           return { ...initial, ...action.payload };
    case "RESET":          return initial;
    default:               return state;
  }
}

/* ─── Hook ──────────────────────────────────────────────── */

interface UseCreateSegmentReturn {
  state:         State;
  dispatch:      React.Dispatch<Action>;
  addFilter:     () => void;
  handleSave:    (previewCount: number, editingSegment?: Segment | null) => Promise<void>;
  reset:         () => void;
  loadSegment:   (seg: Segment) => void;
}

export function useCreateSegment(onSuccess: () => void): UseCreateSegmentReturn {
  const [state, dispatch] = useReducer(reducer, initial);

  function addFilter() {
    const filter: FilterCondition = {
      id:       crypto.randomUUID(),
      field:    "total_orders",
      operator: "gt",
      value:    0,
    };
    dispatch({ type: "ADD_FILTER", payload: filter });
  }

  function loadSegment(seg: Segment) {
    dispatch({
      type: "LOAD",
      payload: {
        name:        seg.name,
        description: seg.description ?? "",
        filters:     seg.filters,
        conjunction: seg.conjunction,
      },
    });
  }

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  async function handleSave(
    previewCount:   number,
    editingSegment: Segment | null = null
  ): Promise<void> {
    const errors = validateSegment(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      return;
    }

    dispatch({ type: "SET_SUBMITTING", payload: true });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const record = {
        user_id:            user.id,
        name:               state.name,
        description:        state.description || null,
        filters:            state.filters,
        conjunction:        state.conjunction,
        contact_count:      previewCount,
        last_calculated_at: new Date().toISOString(),
      };

      const q = (supabase as any).from("segments");
      const { error: dbErr } = editingSegment
        ? await q.update(record).eq("id", editingSegment.id)
        : await q.insert(record);

      if (dbErr) throw new Error(dbErr.message);

      dispatch({ type: "RESET" });
      onSuccess();
    } catch (e) {
      dispatch({
        type:    "SET_ERRORS",
        payload: { submit: (e as Error).message },
      });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }

  return { state, dispatch, addFilter, handleSave, reset, loadSegment };
}
