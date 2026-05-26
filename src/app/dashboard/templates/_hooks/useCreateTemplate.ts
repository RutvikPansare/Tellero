"use client";

import { useReducer, useCallback } from "react";
import { validateStep1, validateStep2, validateAll } from "../_lib/templateValidation";
import type { ButtonItem, TemplateCategory } from "../_lib/templateHelpers";

/* ─── State shape ───────────────────────────────────────── */

export interface CreateTemplateState {
  step:     1 | 2 | 3;
  name:     string;
  category: TemplateCategory | "";
  language: string;
  header:   { enabled: boolean; type: string; text: string; sampleUrl: string };
  body:     string;
  variableLabels: Record<string, string>;
  footer:   { enabled: boolean; text: string };
  buttons:  { enabled: boolean; type: string; items: ButtonItem[] };
  isSubmitting: boolean;
  errors:   Record<string, string>;
}

const initial: CreateTemplateState = {
  step:     1,
  name:     "",
  category: "",
  language: "en",
  header:   { enabled: false, type: "TEXT", text: "", sampleUrl: "" },
  body:     "",
  variableLabels: {},
  footer:   { enabled: false, text: "" },
  buttons:  { enabled: false, type: "QUICK_REPLY", items: [] },
  isSubmitting: false,
  errors:   {},
};

/* ─── Actions ───────────────────────────────────────────── */

export type Action =
  | { type: "SET_FIELD"; field: keyof CreateTemplateState; value: unknown }
  | { type: "SET_HEADER"; patch: Partial<CreateTemplateState["header"]> }
  | { type: "SET_FOOTER"; patch: Partial<CreateTemplateState["footer"]> }
  | { type: "SET_BUTTONS"; patch: Partial<CreateTemplateState["buttons"]> }
  | { type: "ADD_BUTTON";    item: ButtonItem }
  | { type: "REMOVE_BUTTON"; id: string }
  | { type: "UPDATE_BUTTON"; id: string; patch: Partial<ButtonItem> }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "RESET" };

function reducer(state: CreateTemplateState, action: Action): CreateTemplateState {
  switch (action.type) {
    case "SET_FIELD":   return { ...state, [action.field]: action.value, errors: {} };
    case "SET_HEADER":  return { ...state, header:  { ...state.header,  ...action.patch }, errors: {} };
    case "SET_FOOTER":  return { ...state, footer:  { ...state.footer,  ...action.patch }, errors: {} };
    case "SET_BUTTONS": return { ...state, buttons: { ...state.buttons, ...action.patch }, errors: {} };
    case "ADD_BUTTON":
      return { ...state, buttons: { ...state.buttons, items: [...state.buttons.items, action.item] } };
    case "REMOVE_BUTTON":
      return { ...state, buttons: { ...state.buttons, items: state.buttons.items.filter(b => b.id !== action.id) } };
    case "UPDATE_BUTTON":
      return { ...state, buttons: { ...state.buttons, items: state.buttons.items.map(b => b.id === action.id ? { ...b, ...action.patch } : b) } };
    case "NEXT_STEP":       return { ...state, step: Math.min(state.step + 1, 3) as 1|2|3, errors: {} };
    case "PREV_STEP":       return { ...state, step: Math.max(state.step - 1, 1) as 1|2|3, errors: {} };
    case "SET_ERRORS":      return { ...state, errors: action.errors };
    case "SET_SUBMITTING":  return { ...state, isSubmitting: action.value };
    case "RESET":           return initial;
    default:                return state;
  }
}

/* ─── Hook ──────────────────────────────────────────────── */

export function useCreateTemplate(onSuccess: () => void) {
  const [state, dispatch] = useReducer(reducer, initial);

  const goNext = useCallback(() => {
    const errs = state.step === 1
      ? validateStep1(state)
      : validateStep2(state);
    if (Object.keys(errs).length) {
      dispatch({ type: "SET_ERRORS", errors: errs });
      return;
    }
    dispatch({ type: "NEXT_STEP" });
  }, [state]);

  const goBack = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const reset  = useCallback(() => dispatch({ type: "RESET" }),     []);

  const handleSubmit = useCallback(async () => {
    const errs = validateAll(state);
    if (Object.keys(errs).length) {
      dispatch({ type: "SET_ERRORS", errors: errs });
      return;
    }

    dispatch({ type: "SET_SUBMITTING", value: true });
    try {
      const res = await fetch("/api/templates/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:           state.name,
          category:       state.category,
          language:       state.language,
          header:         state.header,
          body:           state.body,
          variableLabels: state.variableLabels,
          footer:         state.footer,
          buttons:        state.buttons,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        throw new Error(error ?? "Submission failed");
      }

      dispatch({ type: "RESET" });
      onSuccess();
    } catch (err) {
      dispatch({ type: "SET_SUBMITTING", value: false });
      dispatch({ type: "SET_ERRORS", errors: { submit: (err as Error).message } });
    }
  }, [state, onSuccess]);

  return { state, dispatch, goNext, goBack, reset, handleSubmit };
}
