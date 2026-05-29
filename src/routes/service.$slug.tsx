import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Globe, Heart, Instagram, Linkedin, MapPin, MessageSquare, Phone, Star, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/service/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Serviço — LDS Hub` }] }),
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          categories(name),
          professionals (
            id, slug, professional_title, company_name, description, rating, total_reviews, verified, premium, ward, user_id, years_experience, website, linkedin, instagram, cover_url,
            profiles:user_id (full_name, city, state, avatar_url, phone, email)
          )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: isFav, refetch: refetchFav } = useQuery({
    queryKey: ["fav", service?.professionals?.id, user?.id],
    enabled: !!service?.professionals && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("id").eq("professional_id", service!.professionals!.id).eq("customer_id", user!.id).maybeSingle();
      return !!data;
    },
  });

  const toggleFav = async () => {
    if (!user || !service?.professionals) { toast.error("Entre para salvar favoritos"); return; }
    if (isFav) {
      await supabase.from("favorites").delete().eq("professional_id", service.professionals.id).eq("customer_id", user.id);
    } else {
      await supabase.from("favorites").insert({ professional_id: service.professionals.id, customer_id: user.id });
    }
    refetchFav();
  };

  const submitQuote = async () => {
    if (!user) { toast.error("Entre para solicitar um orçamento"); return; }
    if (!message.trim()) return toast.error("Adicione uma mensagem");
    const { data: qr, error } = await supabase.from("quote_requests").insert({
      customer_id: user.id, service_id: service!.id, professional_id: service!.professionals!.id, message,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("conversations").insert({ quote_request_id: qr.id, customer_id: user.id, professional_id: service!.professionals!.id });
    toast.success("Pedido de orçamento enviado!");
    setQuoteOpen(false); setMessage("");
  };

  if (isLoading || !service) return (<div className="flex min-h-screen flex-col"><SiteHeader /><main className="container mx-auto flex-1 px-4 py-20 text-center text-muted-foreground">Carregando…</main><SiteFooter /></div>);

  const s: any = service;
  const p: any = s.professionals;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="relative h-40 w-full bg-hero-gradient md:h-56" />
        <div className="container relative z-10 mx-auto -mt-20 px-4 pb-16 md:-mt-28">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-primary-foreground/90 hover:underline mb-4">
                <ArrowLeft className="h-4 w-4" /> Voltar para busca
              </Link>
              
              <Card className="shadow-elegant overflow-hidden">
                <CardContent className="p-0">
                  {s.cover_url || p.cover_url ? (
                    <img src={s.cover_url || p.cover_url} alt={s.title} className="w-full aspect-[21/9] object-cover" />
                  ) : (
                    <div className="w-full aspect-[21/9] bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      Sem imagem de capa
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{s.categories?.name}</Badge>
                      {s.starting_price && <Badge className="bg-primary text-primary-foreground">A partir de R$ {Number(s.starting_price).toFixed(2)}</Badge>}
                    </div>
                    <h1 className="font-display text-3xl font-bold md:text-4xl">{s.title}</h1>
                    <div className="mt-6 prose prose-slate max-w-none">
                      <p className="whitespace-pre-line text-lg text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold mb-4">Sobre o Profissional</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-elegant">
                      {p.profiles?.avatar_url ? (
                        <img src={p.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {(p.profiles?.full_name ?? "?").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{p.profiles?.full_name}</h3>
                        {p.verified && <BadgeCheck className="h-5 w-5 text-primary-glow" />}
                      </div>
                      <div className="text-sm text-muted-foreground">{p.professional_title}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line line-clamp-4">{p.description}</p>
                  <Button asChild variant="link" className="px-0 mt-4 h-auto">
                    <Link to="/professional/$slug" params={{ slug: p.slug }}>Ver perfil completo</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-elegant sticky top-24">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-gold">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="font-bold text-lg text-foreground">{Number(p.rating).toFixed(1)}</span>
                        <span className="text-muted-foreground">({p.total_reviews})</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={toggleFav} className="gap-2">
                        <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : ""}`} />
                        {isFav ? "Salvo" : "Salvar"}
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      {(p.profiles?.city || p.profiles?.state || p.ward) && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>
                            {[p.profiles?.city, p.profiles?.state].filter(Boolean).join(", ")}
                            {p.ward && <><br />Ala {p.ward}</>}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-3">
                      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full h-12 text-lg font-bold gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Pedir Orçamento
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Pedir um orçamento para {s.title}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div><Label>Sua mensagem</Label><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Descreva o que você precisa..." /></div>
                            <Button className="w-full" onClick={submitQuote}>Enviar pedido</Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {p.profiles?.phone && (
                        <Button asChild variant="outline" className="w-full h-12 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white gap-2">
                          <a href={`https://wa.me/55${p.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, te encontrei no LDS Hub e gostaria de um orçamento para o serviço: ${s.title}`)}`} target="_blank" rel="noreferrer">
                            <Phone className="h-5 w-5 fill-current" />
                            WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="pt-6 border-t space-y-4">
                      <div className="flex items-center gap-3">
                        {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>}
                        {p.instagram && <a href={p.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>}
                        {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {p.profiles?.phone && (
        <a
          href={`https://wa.me/55${p.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, te encontrei no LDS Hub e gostaria de um orçamento para o serviço: ${s.title}`)}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:scale-110 active:scale-95 md:h-16 md:w-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
          title="Chamar no WhatsApp"
        >
          <Phone className="h-7 w-7 fill-current md:h-8 md:w-8" />
        </a>
      )}
      <SiteFooter />
    </div>
  );
}
