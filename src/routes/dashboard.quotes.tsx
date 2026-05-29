import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { MessageSquare, Check, X, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/quotes")({
  head: () => ({ meta: [{ title: "Orçamentos — LDS Hub" }] }),
  component: QuotesPage,
});

type QStatus = "pending" | "responded" | "accepted" | "declined" | "closed";

const STATUS_LABEL: Record<QStatus, string> = {
  pending: "Pendente",
  responded: "Respondido",
  accepted: "Aceito",
  declined: "Recusado",
  closed: "Encerrado",
};

const STATUS_COLOR: Record<QStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  responded: "bg-violet-100 text-violet-800 border-violet-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  declined: "bg-rose-100 text-rose-800 border-rose-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

function QuotesPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: pro } = useQuery({
    queryKey: ["pro-q", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("professionals").select("id").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { data: sent, refetch: refSent } = useQuery({
    queryKey: ["q-sent", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("quote_requests")
          .select("*, professionals(slug, professional_title, profiles:user_id(full_name, avatar_url)), services(title)")
          .eq("customer_id", user!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const { data: received, refetch: refRec } = useQuery({
    queryKey: ["q-received", pro?.id],
    enabled: !!pro?.id,
    queryFn: async () =>
      (
        await supabase
          .from("quote_requests")
          .select("*, profiles:customer_id(full_name, avatar_url, phone), services(title)")
          .eq("professional_id", pro!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const updateStatus = async (id: string, status: QStatus, refetch: () => void) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    refetch();
  };

  const filter = (list: any[]) =>
    list.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (
        search &&
        !`${q.message ?? ""} ${q.services?.title ?? ""} ${q.profiles?.full_name ?? ""} ${q.professionals?.professional_title ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Meus orçamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe os pedidos que você enviou{pro ? " e os que recebeu" : ""}.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por nome, serviço ou mensagem…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue={pro ? "received" : "sent"}>
        <TabsList>
          <TabsTrigger value="sent">Enviados ({sent?.length ?? 0})</TabsTrigger>
          {pro && <TabsTrigger value="received">Recebidos ({received?.length ?? 0})</TabsTrigger>}
        </TabsList>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {filter(sent ?? []).map((q: any) => (
            <Card key={q.id}>
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/professional/$slug"
                      params={{ slug: q.professionals?.slug ?? "" }}
                      className="font-semibold hover:underline"
                    >
                      {q.professionals?.profiles?.full_name ?? "Profissional"}
                    </Link>
                    <Badge variant="outline" className={STATUS_COLOR[q.status as QStatus]}>
                      {STATUS_LABEL[q.status as QStatus]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {q.services?.title} • {new Date(q.created_at).toLocaleDateString()}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{q.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/messages">
                      <MessageSquare className="mr-1 h-4 w-4" /> Conversar
                    </Link>
                  </Button>
                  {q.status === "pending" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(q.id, "closed", refSent)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!sent || filter(sent).length === 0) && (
            <Card>
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                Nenhum orçamento enviado ainda.{" "}
                <Link to="/browse" className="text-primary hover:underline">
                  Explorar profissionais
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {pro && (
          <TabsContent value="received" className="mt-4 space-y-3">
            {filter(received ?? []).map((q: any) => (
              <Card key={q.id}>
                <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{q.profiles?.full_name ?? "Cliente"}</span>
                      <Badge variant="outline" className={STATUS_COLOR[q.status as QStatus]}>
                        {STATUS_LABEL[q.status as QStatus]}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {q.services?.title} • {new Date(q.created_at).toLocaleDateString()}
                      {q.budget && ` • Orçamento sugerido: R$ ${q.budget}`}
                    </div>
                    <p className="mt-2 text-sm">{q.message}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(q.id, "accepted", refRec)}>
                          <Check className="mr-1 h-4 w-4" /> Aceitar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(q.id, "declined", refRec)}>
                          <X className="mr-1 h-4 w-4" /> Recusar
                        </Button>
                      </>
                    )}
                    {q.status === "accepted" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(q.id, "closed", refRec)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Concluir
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-1 h-4 w-4" /> Mensagem
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!received || filter(received).length === 0) && (
              <Card>
                <CardContent className="p-12 text-center text-sm text-muted-foreground">
                  Nenhum pedido recebido ainda.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
