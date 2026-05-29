import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Heart,
  MessageSquare,
  Star,
  TrendingUp,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Visão geral — LDS Hub" }] }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-overview", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { data: pro } = useQuery({
    queryKey: ["pro-overview", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("professionals")
          .select("*, services(count), portfolios(count)")
          .eq("user_id", user!.id)
          .maybeSingle()
      ).data,
  });

  const { data: favCount } = useQuery({
    queryKey: ["fav-count-ov", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("favorites").select("id", { count: "exact", head: true }).eq("customer_id", user!.id)).count ?? 0,
  });

  const { data: sentQuotes } = useQuery({
    queryKey: ["quotes-sent-ov", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("quote_requests").select("id, status", { count: "exact" }).eq("customer_id", user!.id)).data ?? [],
  });

  const { data: receivedQuotes } = useQuery({
    queryKey: ["quotes-received-ov", pro?.id],
    enabled: !!pro?.id,
    queryFn: async () =>
      (
        await supabase
          .from("quote_requests")
          .select("*, profiles:customer_id(full_name, avatar_url)")
          .eq("professional_id", pro!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const isPro = !!pro;
  const pendingSent = (sentQuotes ?? []).filter((q: any) => q.status === "pending").length;
  const pendingReceived = (receivedQuotes ?? []).filter((q: any) => q.status === "pending").length;

  const completionItems = [
    { label: "Foto de perfil", done: !!profile?.avatar_url },
    { label: "Telefone", done: !!profile?.phone },
    { label: "Cidade e Estado", done: !!profile?.city && !!profile?.state },
    ...(isPro
      ? [
          { label: "Ala definida", done: !!pro?.ward },
          { label: "Descrição profissional", done: !!pro?.description },
          { label: "Portfólio com itens", done: ((pro as any)?.portfolios?.[0]?.count ?? 0) > 0 },
          { label: "Pelo menos 1 serviço", done: ((pro as any)?.services?.[0]?.count ?? 0) > 0 },
        ]
      : []),
  ];
  const completion = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Olá{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2 border-primary/20 bg-primary/5 text-primary">
              {isPro ? "Modo Profissional" : "Modo Cliente"}
            </Badge>
            {user?.email}
          </p>
        </div>
        {isPro && pro && (
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/professional/$slug" params={{ slug: pro.slug }}>
              Ver meu perfil público <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Heart} label="Favoritos" value={favCount ?? 0} href="/favorites" color="bg-rose-500" />
        <Stat icon={FileText} label="Orçamentos Enviados" value={sentQuotes?.length ?? 0} href="/dashboard/quotes" color="bg-primary" />
        <Stat icon={MessageSquare} label="Mensagens" value="—" href="/messages" color="bg-violet-500" />
        {isPro ? (
          <Stat icon={Star} label="Avaliação" value={Number(pro!.rating).toFixed(1)} color="bg-gold" />
        ) : (
          <Stat icon={TrendingUp} label="Pendentes" value={pendingSent} color="bg-emerald-500" />
        )}
      </div>

      {isPro && (
        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={FileText} label="Pedidos Recebidos" value={receivedQuotes?.length ?? 0} href="/dashboard/quotes" color="bg-blue-500" />
          <Stat icon={Briefcase} label="Serviços ativos" value={(pro as any)?.services?.[0]?.count ?? 0} href="/dashboard/services" color="bg-amber-500" />
          <Stat icon={Calendar} label="Pedidos pendentes" value={pendingReceived} href="/dashboard/quotes" color="bg-emerald-500" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
            <CardDescription>Orçamentos que aguardam sua resposta.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPro && (receivedQuotes ?? []).filter((q: any) => q.status === "pending").length > 0 ? (
              <div className="divide-y">
                {(receivedQuotes ?? [])
                  .filter((q: any) => q.status === "pending")
                  .slice(0, 5)
                  .map((q: any) => (
                    <div key={q.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-bold">
                          {q.profiles?.full_name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{q.profiles?.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(q.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/dashboard/quotes">Responder</Link>
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
                <Calendar className="mb-3 h-8 w-8" />
                <p>Nada pendente por enquanto.</p>
                {!isPro && (
                  <Button variant="link" asChild className="mt-1">
                    <Link to="/browse">Explorar profissionais</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" /> Completude do perfil {completion}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completion} className="h-2" />
            <ul className="space-y-2 text-sm">
              {completionItems.map((c) => (
                <li
                  key={c.label}
                  className={cn("flex items-center gap-2", c.done ? "text-emerald-600" : "text-muted-foreground")}
                >
                  {c.done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-current" />
                  )}
                  {c.label}
                </li>
              ))}
            </ul>
            <Button asChild size="sm" className="mt-2 w-full">
              <Link to="/dashboard/profile">Completar perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {!isPro && (
        <Card className="bg-mesh-navy relative overflow-hidden text-white rounded-3xl shadow-navy">
          <div className="dot-grid absolute inset-0 text-white/5" />
          <CardContent className="relative flex flex-col items-center p-10 text-center">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur-md">
              <Briefcase className="h-8 w-8 text-blue-200" />
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Ofereça seus serviços no LDS Hub
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-blue-100/70">
              Junte-se à maior rede de profissionais da comunidade.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 rounded-full bg-white px-10 font-bold text-primary hover:bg-blue-50"
            >
              <Link to="/become-pro">Tornar-se profissional</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
  color = "bg-accent",
}: {
  icon: any;
  label: string;
  value: any;
  href?: string;
  color?: string;
}) {
  const body = (
    <Card className="group overflow-hidden border-none transition-all hover:shadow-premium">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">
              {label}
            </div>
            <div className="mt-1 font-display text-2xl font-black tracking-tight">{value}</div>
          </div>
          <div
            className={cn(
              "grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110",
              color,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link to={href}>{body}</Link> : body;
}
