import type { ButtonItem } from "./templateHelpers";

interface Step1State {
  name:     string;
  category: string;
  language: string;
}

interface Step2State {
  header:  { enabled: boolean; type: string; text: string; sampleUrl: string };
  body:    string;
  footer:  { enabled: boolean; text: string };
  buttons: { enabled: boolean; type: string; items: ButtonItem[] };
}

const NAME_RE = /^[a-z0-9_]+$/;

export function validateStep1(s: Step1State): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!s.name)                   errors.name     = "Template name is required";
  else if (!NAME_RE.test(s.name))errors.name     = "Only lowercase letters, numbers and underscores";
  else if (s.name.length > 512)  errors.name     = "Name cannot exceed 512 characters";
  if (!s.category)               errors.category = "Select a category";
  if (!s.language)               errors.language = "Select a language";
  return errors;
}

export function validateStep2(s: Step2State): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!s.body)                    errors.body = "Message body is required";
  else if (s.body.length > 1024)  errors.body = "Body cannot exceed 1024 characters";
  else if (/\{[^{]/.test(s.body) || /[^}]\}/.test(s.body))
                                  errors.body = "Check your variables — use {{1}} format";

  if (s.header.enabled && s.header.type === "TEXT") {
    if (s.header.text.length > 60)
      errors.headerText = "Header cannot exceed 60 characters";
  }

  if (s.header.enabled && s.header.type !== "TEXT") {
    if (!s.header.sampleUrl)
      errors.headerSampleUrl = "A sample URL is required for Meta to review your template";
    else if (!/^https?:\/\/.+/.test(s.header.sampleUrl.trim()))
      errors.headerSampleUrl = "Must be a valid URL starting with https://";
  }

  if (s.footer.enabled && s.footer.text.length > 60)
    errors.footer = "Footer cannot exceed 60 characters";

  if (s.buttons.enabled) {
    s.buttons.items.forEach((btn, i) => {
      if (!btn.text) errors[`btn_${i}_text`] = "Button label is required";
      else if (btn.text.length > 25) errors[`btn_${i}_text`] = "Max 25 characters";

      if (btn.subtype === "URL" && btn.value && !/^https?:\/\//.test(btn.value))
        errors[`btn_${i}_value`] = "Must be a valid URL starting with https://";

      if (btn.subtype === "PHONE_NUMBER" && btn.value && !/^\+\d{7,15}$/.test(btn.value))
        errors[`btn_${i}_value`] = "Include country code, e.g. +919876543210";
    });
  }

  return errors;
}

export function validateAll(s: Step1State & Step2State): Record<string, string> {
  return { ...validateStep1(s), ...validateStep2(s) };
}
