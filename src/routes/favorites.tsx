import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favoritos — LDS Hub" }] }),
  component: Favorites,
});

function Favorites() {
  const { user } = useAuth();
  const { data: favs } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("favorites").select("*, professionals (*, profiles:user_id (full_name, city, state))").eq("customer_id", user!.id)).data ?? [],
  });

  if (!user) return (<div className="flex min-h-screen flex-col"><SiteHeader /><main className="container mx-auto flex-1 px-4 py-20 text-center"><h1 className="font-display text-2xl font-bold">Entre para ver seus favoritos</h1><Button asChild className="mt-6"><Link to="/login">Entrar</Link></Button></main><SiteFooter /></div>);

  return (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2"><Heart className="h-7 w-7 text-destructive" />Seus favoritos</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(favs ?? []).map((f: any) => (
            <Link key={f.id} to="/professional/$slug" params={{ slug: f.professionals.slug }}>
              <Card className="transition-all hover:shadow-elegant"><CardContent className="p-5">
                <div className="font-semibold">{f.professionals.profiles?.full_name}</div>
                <div className="text-sm text-muted-foreground">{f.professionals.professional_title}</div>
              </CardContent></Card>
            </Link>
          ))}
          {(!favs || favs.length === 0) && <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-12 text-center text-muted-foreground">Nenhum favorito ainda — explore e salve os profissionais que você gostar.</CardContent></Card>}
        </div>
      </main><SiteFooter />
    </div>
  );
}
