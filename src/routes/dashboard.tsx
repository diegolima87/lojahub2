import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Share2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Painel — LDS Hub" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, loading } = useAuth();

  const { data: pro } = useQuery({
    queryKey: ["my-pro-layout", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("professionals").select("id").eq("user_id", user!.id).maybeSingle()).data,
  });

  if (loading) return null;
  if (!user)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">Entre para ver seu painel</h1>
          <p className="mt-2 text-muted-foreground">Você precisa estar logado para acessar as ferramentas de profissional e orçamentos.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Voltar</Link>
            <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Entrar agora</Link>
          </div>
        </div>
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar isPro={!!pro} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-4 flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Painel Administrativo</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
