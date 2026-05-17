"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/services/api/conversations.api";
import { useOrganizationStore } from "@/stores/organization-store";
import type { ConversationCreate } from "@/types";

export function useConversations(params?: { limit?: number; offset?: number; channel?: string }) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["conversations", orgId, params],
    queryFn: () => conversationsApi.list(orgId!, params),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useConversation(id: string | undefined) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationsApi.get(id!, orgId!),
    enabled: !!id && !!orgId,
    select: (res) => res.data,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ConversationCreate) => conversationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useAddMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content, senderType }: { conversationId: string; content: string; senderType?: string }) =>
      conversationsApi.addMessage(conversationId, content, senderType),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
    },
  });
}
