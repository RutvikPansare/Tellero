/** Typed wrapper for Meta Graph API template endpoints */

export class TemplateApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public context?: unknown
  ) {
    super(message);
    this.name = "TemplateApiError";
  }
}

export interface MetaComponent {
  type:    "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?:   string;
  buttons?: MetaButton[];
  example?: { header_url?: string[]; body_text?: string[][] };
}

export interface MetaButton {
  type:         "PHONE_NUMBER" | "URL" | "QUICK_REPLY";
  text:         string;
  phone_number?: string;
  url?:          string;
}

export interface MetaTemplatePayload {
  name:       string;
  language:   string;
  category:   "MARKETING" | "UTILITY" | "AUTHENTICATION";
  components: MetaComponent[];
}

const BASE = "https://graph.facebook.com/v19.0";

async function metaFetch<T>(
  url: string,
  options: RequestInit,
  context: string
): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json() as { error?: { message: string; code: number } } & T;

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? `Meta API error (${res.status})`;
    console.error(`[metaTemplateApi] ${context}:`, msg);
    throw new TemplateApiError(msg, json.error?.code ?? res.status, json);
  }

  return json;
}

export async function submitTemplate(
  wabaId: string,
  accessToken: string,
  payload: MetaTemplatePayload
): Promise<{ id: string; status: string }> {
  return metaFetch<{ id: string; status: string }>(
    `${BASE}/${wabaId}/message_templates`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...payload, access_token: accessToken }),
    },
    `submitTemplate(${payload.name})`
  );
}

export async function getTemplateStatus(
  wabaId: string,
  accessToken: string,
  templateId: string
): Promise<{ status: string; reason?: string; category?: string }> {
  const data = await metaFetch<{
    data: Array<{ id: string; status: string; rejected_reason?: string; category?: string }>;
  }>(
    `${BASE}/${wabaId}/message_templates?fields=id,status,rejected_reason,category&access_token=${accessToken}`,
    { method: "GET" },
    `getTemplateStatus(${templateId})`
  );

  const found = data.data.find((t) => t.id === templateId);
  if (!found) throw new TemplateApiError(`Template ${templateId} not found`, 404);

  return { status: found.status, reason: found.rejected_reason, category: found.category };
}

export async function deleteTemplate(
  wabaId: string,
  accessToken: string,
  templateName: string
): Promise<{ success: boolean }> {
  await metaFetch<{ success: boolean }>(
    `${BASE}/${wabaId}/message_templates?name=${templateName}&access_token=${accessToken}`,
    { method: "DELETE" },
    `deleteTemplate(${templateName})`
  );
  return { success: true };
}
