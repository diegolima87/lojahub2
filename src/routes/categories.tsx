import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CategoryIcon } from "@/components/category-icon";


export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categorias — LDS Hub" }] }),
  component: () => {
    const { data } = useQuery({ queryKey: ["cats"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });
    return (
      <div className="flex min-h-screen flex-col"><SiteHeader />
        <main className="container mx-auto flex-1 px-4 py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight">Todas as categorias</h1>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(data ?? []).map((c) => (
              <Link key={c.id} to="/browse" search={{ category: c.slug } as never}>
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                        <CategoryIcon name={c.icon || "Sparkles"} className="h-5 w-5" />
                      </div>

                      <div className="font-semibold">{c.name}</div>
                    </div>
                  </CardContent>
                </Card>

              </Link>
            ))}
          </div>
        </main><SiteFooter /></div>
    );
  },
});
