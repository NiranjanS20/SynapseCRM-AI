"use client";

import { useState } from "react";
import { MessageSquare, Mail, Phone, Video, Hash } from "lucide-react";
import { useConversations, useConversation, useAddMessage } from "@/hooks/use-conversations";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const channelColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400",
  call: "bg-emerald-500/10 text-emerald-400",
  meeting: "bg-violet-500/10 text-violet-400",
  chat: "bg-amber-500/10 text-amber-400",
};

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useConversations({ limit: 50 });
  const { data: selected } = useConversation(selectedId || undefined);
  const addMessage = useAddMessage();
  const [msg, setMsg] = useState("");

  const handleSend = async () => {
    if (!selectedId || !msg.trim()) return;
    await addMessage.mutateAsync({ conversationId: selectedId, content: msg });
    setMsg("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">Conversations</h1>
        <p className="text-sm text-slate-400">Communication threads with your leads</p>
      </div>
      {isLoading ? <SkeletonTable rows={6} /> : !data || data.items.length === 0 ? (
        <EmptyState title="No conversations yet" description="Start communicating with your leads" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto">
            {data.items.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn("w-full text-left rounded-xl border p-4 transition-all", selectedId === c.id ? "border-sage-500/30 bg-sage-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10")}>
                <div className="flex justify-between mb-1">
                  <span className={cn("text-xs font-medium rounded-full px-2 py-0.5", channelColors[c.channel] || "text-slate-400")}>{c.channel}</span>
                  <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{c.subject || "No subject"}</p>
                <p className="text-xs text-slate-500 truncate mt-1">{c.message}</p>
              </button>
            ))}
          </div>
          <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col min-h-[50vh]">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState title="Select a conversation" description="Click to view the thread" />
              </div>
            ) : (
              <>
                <div className="border-b border-white/5 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">{selected.subject || "Conversation"}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="rounded-lg bg-white/5 p-4">
                    <p className="text-sm text-slate-300">{selected.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                  {(selected as any).messages?.map((m: any) => (
                    <div key={m.id} className={cn("rounded-lg p-4 max-w-[80%]", m.sender_type === "user" ? "bg-sage-500/10 ml-auto" : "bg-white/5")}>
                      <p className="text-sm text-slate-300">{m.content}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 p-4 flex gap-3">
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Reply..." className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sage-500 focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSend()} />
                  <Button onClick={handleSend} disabled={!msg.trim()}>Send</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
