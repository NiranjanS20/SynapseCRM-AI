import { api } from "./index";
import type { ApiEnvelope, PaginatedData, Conversation, ConversationCreate, Message } from "@/types";

export const conversationsApi = {
  list(organizationId: string, params?: { limit?: number; offset?: number; channel?: string }) {
    return api.get<ApiEnvelope<PaginatedData<Conversation>>>("/conversations", {
      organization_id: organizationId,
      ...params,
    });
  },

  get(id: string, organizationId: string) {
    return api.get<ApiEnvelope<Conversation & { messages: Message[] }>>(`/conversations/${id}`, {
      organization_id: organizationId,
    });
  },

  create(data: ConversationCreate) {
    return api.post<ApiEnvelope<Conversation>>("/conversations", data);
  },

  addMessage(conversationId: string, content: string, senderType = "user") {
    return api.post<ApiEnvelope<Message>>(`/conversations/${conversationId}/messages`, {
      content,
      sender_type: senderType,
    });
  },
};
