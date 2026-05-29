import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ArrowRight, ArrowUpRight, BadgeCheck, MessageSquare, Search, Sparkles, Star, ShieldCheck, Users, ShieldAlert, Share2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LDS Hub — Conexões Profissionais para a Comunidade SUD" },
      { name: "description", content: "Encontre profissionais qualificados ou ofereça seus próprios serviços em um marketplace comunitário premium baseado em valores compartilhados." },

    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showError, setShowError] = useState(false);
  


  const { data: categories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("active", true).order("name");
      if (!data) return [];
      return data.slice(0, 8);
    },
  });

  const { data: pros } = useQuery({
    queryKey: ["home-featured-pros"],
    queryFn: async () => {
      const { data } = await supabase
        .from("professionals")
        .select("id, slug, professional_title, company_name, rating, total_reviews, verified, premium, cover_url, profiles:user_id (full_name, city, state, avatar_url)")
        .order("rating", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 3) {
      setShowError(true);
      return;
    }
    setShowError(false);
    navigate({ to: "/browse", search: (q ? { q } : {}) as never });
  };



  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="bg-mesh-navy relative overflow-hidden text-white">
          <div className="dot-grid pointer-events-none absolute inset-0 text-white/[0.06]" />
          <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-primary-glow/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-primary-glow/10 blur-3xl" />

          <div className="container relative mx-auto px-4 lg:px-[150px] pt-24 pb-40 md:pt-32 md:pb-48">
            <div className="mx-auto max-w-4xl text-center animate-fade-up">
              <Badge className="mb-8 gap-2 border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur-md hover:bg-white/[0.1]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-300" />
                </span>
                Conectando a comunidade SUD
              </Badge>
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md shadow-glow">
                  <Share2 className="h-8 w-8" />
                </div>
              </div>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem]">
                LDS <span className="text-primary-glow">Hub</span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-blue-100/75 md:text-xl">
                A maior rede de profissionais qualificados que compartilham seus valores e o compromisso com a qualidade.
              </p>

              {/* Premium search bar */}
              <div className="relative mx-auto mt-12 max-w-2xl">
                {showError && (
                  <div className="absolute -top-12 left-0 right-0 z-20 flex justify-center animate-fade-up">
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20">
                      <ShieldAlert className="h-4 w-4" />
                      Por favor, digite pelo menos 3 letras para buscar.
                    </div>
                  </div>
                )}
                <form onSubmit={onSearch} className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-navy md:flex-row">

                <div className="flex flex-1 items-center gap-3 px-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      if (e.target.value.trim().length >= 3) setShowError(false);
                    }}

                    placeholder="Qual profissional você precisa hoje?"
                    className="h-12 border-0 bg-transparent p-0 text-base text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 rounded-xl px-8 font-bold transition-transform hover:scale-[1.02] active:scale-95">
                  Buscar agora
                </Button>
              </form>
            </div>


              {/* Social proof */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-100/60">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-300" /> Profissionais verificados</div>
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-blue-300" /> Avaliações reais</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-300" /> Comunidade SUD</div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES — Bento Grid */}
        <section className="container relative z-10 mx-auto -mt-24 px-4 lg:px-[150px] pb-20">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {(categories ?? []).slice(0, 1).map((c) => (
              <Link
                key={c.id}
                to="/browse"
                search={{ category: c.slug } as never}
                className="hover-lift group relative col-span-2 row-span-2 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-premium md:p-10"
              >
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary transition-transform group-hover:scale-110">
                    <CategoryIcon name={c.icon || "Sparkles"} className="h-8 w-8" />
                  </div>


                  <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{c.name}</h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">Encontre os melhores profissionais desta categoria na nossa comunidade.</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Explorar categoria <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
            {(categories ?? []).slice(1, 5).map((c) => (
              <Link
                key={c.id}
                to="/browse"
                search={{ category: c.slug } as never}
                className="hover-lift group rounded-3xl border border-border bg-card p-6 shadow-elegant"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <CategoryIcon name={c.icon || "Sparkles"} className="h-6 w-6" />
                </div>


                <h3 className="mt-4 font-display font-bold tracking-tight">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">Profissionais qualificados</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              asChild 
              className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse-subtle shadow-lg transition-all hover:scale-105"
            >
              <Link to="/categories">Ver todas as categorias <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* FEATURED PROFESSIONALS */}
        <section className="bg-subtle-gradient py-24">
          <div className="container mx-auto px-4 lg:px-[150px]">
            <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Em destaque</span>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Profissionais bem avaliados</h2>
                <p className="mt-3 text-lg text-muted-foreground">Os membros mais bem recomendados pela nossa rede.</p>
              </div>
              <Button variant="outline" asChild className="rounded-full px-6">
                <Link to="/browse">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(pros ?? []).map((p: any) => {
                const name = p.profiles?.full_name ?? "Profissional";
                const loc = [p.profiles?.city, p.profiles?.state].filter(Boolean).join(", ");
                return (
                  <Link
                    key={p.id}
                    to="/professional/$slug"
                    params={{ slug: p.slug }}
                    className="hover-lift group relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant transition-shadow hover:shadow-premium"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-accent">
                      <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
                        {p.cover_url ? (
                          <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="dot-grid absolute inset-0 text-primary/10" />
                        )}
                      </div>
                      {p.premium && (
                        <Badge className="absolute right-4 top-4 gap-1 bg-gold text-gold-foreground hover:bg-gold/90">
                          <Sparkles className="h-3 w-3" /> Premium
                        </Badge>
                      )}
                      <div className="absolute -bottom-8 left-6 grid h-20 w-20 place-items-center rounded-2xl border-4 border-card bg-primary text-2xl font-bold text-primary-foreground shadow-elegant">
                        {p.profiles?.avatar_url ? (
                          <img src={p.profiles.avatar_url} alt={name} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          name.charAt(0)
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-12">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate font-display text-lg font-bold">{name}</h3>
                            {p.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary-glow" />}
                          </div>
                          <p className="truncate text-sm font-semibold text-primary">{p.professional_title}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold-foreground">
                          <Star className="h-3 w-3 fill-current text-gold" />
                          {Number(p.rating).toFixed(1)}
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">{loc || "Brasil"}</span>
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {(!pros || pros.length === 0) && (
                <div className="relative overflow-hidden rounded-3xl bg-mesh-navy p-12 text-center shadow-navy md:col-span-2 lg:col-span-3">
                  <div className="dot-grid pointer-events-none absolute inset-0 text-white/5" />
                  <div className="relative mx-auto max-w-md">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-bold text-white md:text-3xl">Destaque-se na nossa rede</h3>
                    <p className="mt-3 text-blue-100/70">Nossa comunidade está crescendo. Seja um dos primeiros a oferecer seus serviços.</p>
                    <Button asChild size="lg" className="mt-8 rounded-full bg-white px-8 font-bold text-primary shadow-navy hover:bg-blue-50">
                      <Link to="/signup">Oferecer meus serviços</Link>
                    </Button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container mx-auto px-4 lg:px-[150px] py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Processo simples</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Como funciona</h2>
            <p className="mt-3 text-lg text-muted-foreground">Da busca à conclusão em três passos.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              { icon: Search, num: "01", title: "Pesquise", desc: "Filtre especialistas por categoria, experiência e localização." },
              { icon: MessageSquare, num: "02", title: "Conecte-se", desc: "Inicie uma conversa direta, peça orçamento ou chame no WhatsApp." },
              { icon: Star, num: "03", title: "Contrate e avalie", desc: "Conclua com segurança e fortaleça a rede de recomendações da comunidade." },
            ].map((s) => (
              <div key={s.num} className="hover-lift relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elegant">
                <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[6rem] font-black leading-none text-accent/40">{s.num}</span>
                <div className="relative">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 lg:px-[150px] pb-24">
          <div className="bg-mesh-navy relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center text-white shadow-navy md:px-16 md:py-28">
            <div className="dot-grid pointer-events-none absolute inset-0 text-white/[0.06]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-glow/15 blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">
                Pronto para <span className="italic font-medium text-blue-200">começar?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100/70 md:text-xl">
                Seja como cliente ou profissional, o LDS Hub é o seu lugar para conexões significativas.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="rounded-full bg-white px-10 font-bold text-primary hover:bg-blue-50">
                  <Link to="/signup">Criar minha conta</Link>
                </Button>

                <Button size="lg" variant="outline" asChild className="rounded-full border-white/20 bg-white/5 px-10 font-bold text-white backdrop-blur-md hover:bg-white/10 hover:text-white">
                  <Link to="/signup">Tornar-se profissional</Link>
                </Button>


              </div>
            </div>
          </div>
        </section>

        {/* DISCLAIMER SECTION */}
        <section className="bg-white py-20 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50 p-8 md:p-12 border border-slate-200 flex flex-col md:flex-row items-center gap-8 animate-fade-up">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 mb-3">Nota Importante de Transparência</h3>
                <p className="text-slate-600 leading-relaxed">
                  O <strong>LDS Hub</strong> é uma plataforma independente criada por membros da comunidade para fomentar o apoio mútuuo e conexões profissionais. 
                  É importante destacar que <strong>não somos um site oficial, ferramenta ou representante de A Igreja de Jesus Cristo dos Santos dos Últimos Dias.</strong> 
                  Operamos de forma autônoma e privada, sem vínculo institucional ou endosso oficial da Igreja.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/about" className="text-sm font-bold text-primary hover:underline">Sobre o projeto</Link>
                  <Link to="/terms" className="text-sm font-bold text-primary hover:underline">Termos de Uso</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
