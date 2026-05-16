import { apiGet, apiPost } from "@/lib/api";
import type { Conversation, ConversationCreate, Message, PaginatedData } from "@/types";

const BASE = "/api/v1/conversations";

export const conversationsApi = {
  list: (organizationId: string, params?: { lead_id?: string; channel?: string; limit?: number; offset?: number }) =>
    apiGet<PaginatedData<Conversation>>(BASE, { organization_id: organizationId, ...params }),
  get: (id: string, organizationId: string) => apiGet<Conversation>(`${BASE}/${id}`, { organization_id: organizationId }),
  create: (data: ConversationCreate) => apiPost<Conversation>(BASE, data),
  listMessages: (convId: string, params?: { limit?: number; offset?: number }) =>
    apiGet<PaginatedData<Message>>(`${BASE}/${convId}/messages`, params),
  addMessage: (convId: string, data: { sender_type?: string; content: string }, organizationId: string) =>
    apiPost<Message>(`${BASE}/${convId}/messages`, data, { organization_id: organizationId }),
};
