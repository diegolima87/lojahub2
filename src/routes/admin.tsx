import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — LDS Hub" }] }),
  component: Admin,
});

function Admin() {
  const { user, roles, loading } = useAuth();
  const isAdmin = roles.includes("admin");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"], enabled: isAdmin,
    queryFn: async () => {
      const [users, pros, services, subs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return { users: users.count ?? 0, pros: pros.count ?? 0, services: services.count ?? 0, subs: subs.count ?? 0 };
    },
  });

  const { data: pendingPros, refetch: refetchPros } = useQuery({
    queryKey: ["admin-pending-pros"], enabled: isAdmin,
    queryFn: async () => (await supabase.from("professionals").select("*, profiles:user_id (full_name)").eq("verification_status", "pending")).data ?? [],
  });

  const verifyPro = async (id: string, status: string) => {
    await supabase.from("professionals").update({ verification_status: status, is_verified: status === "verified" }).eq("id", id);
    refetchPros();
  };

  if (loading) return null;
  if (!user || !isAdmin) return (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Acesso administrativo necessário</h1>
        <p className="mt-2 text-muted-foreground">Sua conta não possui privilégios de administrador.</p>
        <Button asChild className="mt-6"><Link to="/">Voltar para o início</Link></Button>
      </main><SiteFooter /></div>
  );

  return (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Usuários", value: stats?.users },
            { label: "Profissionais", value: stats?.pros },
            { label: "Serviços", value: stats?.services },
            { label: "Assinaturas ativas", value: stats?.subs },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <div className="font-display text-3xl font-bold">{s.value ?? "—"}</div>
            </CardContent></Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Verificações pendentes</h2>
          <Card className="mt-4"><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-4 font-semibold">Profissional</th>
                    <th className="p-4 font-semibold">Título</th>
                    <th className="p-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(pendingPros ?? []).map((p: any) => (
                    <tr key={p.id}>
                      <td className="p-4 font-medium">{p.profiles?.full_name}</td>
                      <td className="p-4 text-muted-foreground">{p.professional_title}</td>
                      <td className="p-4 space-x-2">
                        <Button size="sm" onClick={() => verifyPro(p.id, "verified")}>Aprovar</Button>
                        <Button size="sm" variant="destructive" onClick={() => verifyPro(p.id, "rejected")}>Rejeitar</Button>
                      </td>
                    </tr>
                  ))}
                  {(!pendingPros || pendingPros.length === 0) && (
                    <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Nenhuma solicitação pendente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      </main><SiteFooter />
    </div>
  );
}
