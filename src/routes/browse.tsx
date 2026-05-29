import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, MapPin, Star, Sparkles, Search, Briefcase, Building, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { states, fetchCities } from "@/lib/location";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Search = { category?: string; q?: string; state?: string; city?: string; ward?: string };

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    state: typeof s.state === "string" ? s.state : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
    ward: typeof s.ward === "string" ? s.ward : undefined,
  }),

  head: () => ({ meta: [{ title: "Explorar Serviços — LDS Hub" }, { name: "description", content: "Busque serviços e profissionais qualificados por categoria, localização e avaliação." }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { category, q, state, city, ward } = Route.useSearch();

  const navigate = Route.useNavigate();
  const [search, setSearch] = useState(q ?? "");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (state) {
      fetchCities(state).then(setCities);
    } else {
      setCities([]);
    }
  }, [state]);

  const { data: categories } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ["browse-services", category, q, state, city, ward],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          id, title, description, slug, starting_price, cover_url,
          categories(name, slug),
          professionals (
            id, slug, professional_title, company_name, description, rating, total_reviews, verified, premium, ward, cover_url,
            profiles:user_id (full_name, city, state, avatar_url)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      let filtered = data ?? [];

      if (category) filtered = filtered.filter((s: any) => s.categories?.slug === category);
      if (state) filtered = filtered.filter((s: any) => s.professionals?.profiles?.state === state);
      if (city) filtered = filtered.filter((s: any) => s.professionals?.profiles?.city === city);
      if (ward) filtered = filtered.filter((s: any) => s.professionals?.ward?.toLowerCase().includes(ward.toLowerCase()));

      if (q && q.trim().length > 0) {
        const normalize = (str: string) =>
          (str ?? "")
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const tokens = normalize(q).split(/\s+/).filter(Boolean);

        const scored = filtered.map((s: any) => {
          const pro = s.professionals ?? {};
          const prof = pro.profiles ?? {};
          const serviceText = normalize(`${s.title ?? ""} ${s.description ?? ""}`);
          const proHeader = normalize(`${pro.professional_title ?? ""} ${pro.company_name ?? ""} ${prof.full_name ?? ""}`);
          const bioText = normalize(`${pro.description ?? ""} ${pro.ward ?? ""} ${prof.city ?? ""} ${prof.state ?? ""}`);
          const combined = `${serviceText} ${proHeader} ${bioText}`;

          const allMatch = tokens.every((t) => combined.includes(t));
          if (!allMatch) return null;

          let score = 0;
          tokens.forEach((t) => {
            if (serviceText.includes(t)) score += 3;
            else if (proHeader.includes(t)) score += 2;
            else if (bioText.includes(t)) score += 1;
          });
          return { service: s, score };
        }).filter(Boolean) as { service: any; score: number }[];

        scored.sort((a, b) => b.score - a.score);
        filtered = scored.map((x) => x.service);
      }

      return filtered;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="bg-subtle-gradient border-b">
          <div className="container mx-auto px-4 lg:px-[150px] py-12">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground/90">Explorar serviços</h1>
            <p className="mt-2 text-muted-foreground font-medium">{services?.length ?? 0} profissionais prontos para te atender</p>
            
            <div className="mt-8 grid gap-4 w-full">
              {/* Barra Principal */}
              <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
                <form 
                  className="relative flex-[2] group" 
                  onSubmit={(e) => { e.preventDefault(); navigate({ search: (prev: Search) => ({ ...prev, q: search || undefined }) }); }}
                >
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    placeholder="Buscar por nome, título ou palavra-chave (ex: PHP, WordPress)" 
                    className="h-14 pl-12 pr-4 text-base shadow-sm border-muted-foreground/30 focus-visible:ring-primary/20 bg-background transition-all" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                  />
                </form>

                <Select value={category ?? "all"} onValueChange={(v) => navigate({ search: (prev: Search) => ({ ...prev, category: v === "all" ? undefined : v }) })}>
                  <SelectTrigger className="h-14 lg:w-72 bg-background shadow-sm border-muted-foreground/30 focus:ring-primary/20 text-base">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Todas as categorias" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => navigate({ search: (prev: Search) => ({ ...prev, q: search || undefined }) })}
                  className="h-14 px-8 font-bold text-base shadow-elegant transition-all hover:scale-[1.02]"
                >
                  BUSCAR
                </Button>
              </div>

              {/* Barra de Localização */}
              <div className="flex flex-col gap-2 md:flex-row">
                <Select value={state ?? "all"} onValueChange={(v) => navigate({ search: (prev: Search) => ({ ...prev, state: v === "all" ? undefined : v, city: undefined }) })}>
                  <SelectTrigger className="h-12 md:w-56 bg-background shadow-sm border-muted-foreground/30">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Estado" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={city ?? "all"} onValueChange={(v) => navigate({ search: (prev: Search) => ({ ...prev, city: v === "all" ? undefined : v }) })} disabled={!state}>
                  <SelectTrigger className="h-12 md:w-72 bg-background shadow-sm border-muted-foreground/30 disabled:opacity-50 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Cidade" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1 group">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    placeholder={city ? `Filtrar Ala em ${city}` : "Selecione uma cidade primeiro"} 
                    className="h-12 pl-10 shadow-sm border-muted-foreground/30 disabled:opacity-40 bg-background transition-all"
                    value={ward ?? ""} 
                    disabled={!city}
                    onChange={(e) => navigate({ search: (prev: Search) => ({ ...prev, ward: e.target.value || undefined }) })} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 lg:px-[150px] py-10">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="h-40 animate-pulse" /></Card>)}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s: any) => (
                <Link key={s.id} to="/service/$slug" params={{ slug: s.slug }}>
                  <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-elegant">
                    <div className="h-32 w-full bg-muted">
                      {(s.cover_url || s.professionals?.cover_url) ? (
                        <img src={s.cover_url || s.professionals?.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="bg-hero-gradient h-full w-full opacity-10" />
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="-mt-10 relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm">
                          {s.professionals?.profiles?.avatar_url ? (
                            <img src={s.professionals.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-semibold text-lg">
                              {(s.professionals?.profiles?.full_name ?? "?").charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <div className="truncate font-semibold">{s.title}</div>
                          </div>
                          <div className="truncate text-sm text-muted-foreground">{s.professionals?.profiles?.full_name}</div>
                          {(s.professionals?.profiles?.city || s.professionals?.profiles?.state || s.professionals?.ward) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {[s.professionals?.profiles?.city, s.professionals?.profiles?.state].filter(Boolean).join(", ")}
                              {s.professionals?.ward && ` • Ala ${s.professionals?.ward}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                        <div className="flex items-center gap-1 text-gold">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold text-foreground">{Number(s.professionals?.rating).toFixed(1)}</span>
                        </div>
                        {s.starting_price && <span className="font-semibold text-primary">A partir de R$ {Number(s.starting_price).toFixed(0)}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-secondary/20">
              <CardContent className="flex flex-col items-center gap-6 p-16 text-center">
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold">Ainda não há profissionais nesta categoria</h3>
                  <p className="text-muted-foreground">Seja o pioneiro e comece a receber solicitações hoje mesmo.</p>
                </div>
                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-elegant transition-transform hover:scale-105">
                  <Link to="/become-pro">SEJA O PRIMEIRO A OFERECER SEUS SERVIÇOS</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
