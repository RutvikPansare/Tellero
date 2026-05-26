import type { FilterCondition } from "@/types/segments";

interface SegmentFormState {
  name:        string;
  description: string;
  filters:     FilterCondition[];
  conjunction: "AND" | "OR";
}

export function validateSegment(state: SegmentFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!state.name.trim()) {
    errors.name = "Segment name is required";
  } else if (state.name.trim().length > 80) {
    errors.name = "Name must be 80 characters or fewer";
  }

  if (state.filters.length === 0) {
    errors.filters = "Add at least one filter condition";
  }

  state.filters.forEach((f, i) => {
    if (!f.field) {
      errors[`filter_${i}_field`] = "Select a field";
    }
    if (!f.operator) {
      errors[`filter_${i}_operator`] = "Select an operator";
    }
    if (f.value === null || f.value === "" || f.value === undefined) {
      if (f.field !== "tag" && f.field !== "not_tag") {
        errors[`filter_${i}_value`] = "Enter a value";
      }
    }
    if ((f.field === "tag" || f.field === "not_tag") && !f.value) {
      errors[`filter_${i}_value`] = "Select a tag";
    }
    if (f.field === "attribute") {
      const pair = f.value as string[] | null;
      if (!pair?.[0]) {
        errors[`filter_${i}_value`] = "Enter an attribute key";
      }
    }
  });

  return errors;
}
