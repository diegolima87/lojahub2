import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Mensagens — LDS Hub" }] }),
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const { data: convos, refetch } = useQuery({
    queryKey: ["convos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("conversations")
        .select("*, professionals (slug, profiles:user_id (full_name)), profiles:customer_id (full_name)")
        .or(`customer_id.eq.${user!.id},professional_id.in.(${(await supabase.from("professionals").select("id").eq("user_id", user!.id)).data?.map((p) => p.id).join(",") || "00000000-0000-0000-0000-000000000000"})`)
        .order("last_message_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: msgs, refetch: refetchMsgs } = useQuery({
    queryKey: ["msgs", activeId],
    enabled: !!activeId,
    queryFn: async () => (await supabase.from("messages").select("*").eq("conversation_id", activeId!).order("created_at")).data ?? [],
  });

  useEffect(() => {
    if (!activeId) return;
    const ch = supabase.channel(`msgs-${activeId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` }, () => refetchMsgs()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId, refetchMsgs]);

  const send = async () => {
    if (!text.trim() || !activeId || !user) return;
    await supabase.from("messages").insert({ conversation_id: activeId, sender_id: user.id, message: text });
    setText(""); refetch();
  };

  if (!user) return (<div className="flex min-h-screen flex-col"><SiteHeader /><main className="container mx-auto flex-1 px-4 py-20 text-center"><h1 className="font-display text-2xl font-bold">Entre para ver suas mensagens</h1><Button asChild className="mt-6"><Link to="/login">Entrar</Link></Button></main><SiteFooter /></div>);

  return (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mensagens</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[300px_1fr]">
          <Card><CardContent className="p-2">
            {(convos ?? []).map((c: any) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full rounded-md p-3 text-left text-sm transition-colors hover:bg-accent ${activeId === c.id ? "bg-accent" : ""}`}>
                <div className="font-semibold">{c.customer_id === user.id ? c.professionals?.profiles?.full_name : c.profiles?.full_name}</div>
                <div className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleDateString()}</div>
              </button>
            ))}
            {(!convos || convos.length === 0) && <div className="p-6 text-center text-sm text-muted-foreground">Nenhuma conversa ainda.</div>}
          </CardContent></Card>
          <Card className="flex min-h-[500px] flex-col"><CardContent className="flex flex-1 flex-col p-4">
            {activeId ? (
              <>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {(msgs ?? []).map((m) => (
                    <div key={m.id} className={`max-w-[75%] rounded-lg p-3 text-sm ${m.sender_id === user.id ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.message}</div>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-4 flex gap-2">
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite uma mensagem…" />
                  <Button type="submit"><Send className="h-4 w-4" /></Button>
                </form>
              </>
            ) : <div className="m-auto text-center text-sm text-muted-foreground">Selecione uma conversa</div>}
          </CardContent></Card>
        </div>
      </main><SiteFooter />
    </div>
  );
}
