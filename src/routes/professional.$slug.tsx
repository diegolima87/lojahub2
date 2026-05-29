import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ExternalLink, Globe, Heart, Instagram, Linkedin, MapPin, MessageSquare, Phone, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
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

export const Route = createFileRoute("/professional/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Profissional — LDS Hub` }] }),

  component: ProPage,
});

function ProPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);


  const { data: pro, isLoading, refetch: refetchPro } = useQuery({
    queryKey: ["pro", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select(`
          id, slug, professional_title, company_name, description, rating, total_reviews, verified, premium, ward, user_id, years_experience, website, linkedin, instagram,
          profiles:user_id (full_name, city, state, avatar_url, email, phone),
          services (*),
          portfolios (*),
          reviews (*, profiles:customer_id (full_name, avatar_url))
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching pro:", error);
        throw error;
      }
      
      if (!data) throw notFound();
      return data;
    },

    retry: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => (prev !== null && pro?.portfolios && prev < pro.portfolios.length - 1 ? prev + 1 : prev));
      } else if (e.key === "Escape") {
        setActivePhotoIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, pro?.portfolios]);


  const { data: isFav, refetch: refetchFav } = useQuery({
    queryKey: ["fav", pro?.id, user?.id],
    enabled: !!pro && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("id").eq("professional_id", pro!.id).eq("customer_id", user!.id).maybeSingle();
      return !!data;
    },
  });

  const toggleFav = async () => {
    if (!user || !pro) { toast.error("Entre para salvar favoritos"); return; }
    if (isFav) {
      await supabase.from("favorites").delete().eq("professional_id", pro.id).eq("customer_id", user.id);
    } else {
      await supabase.from("favorites").insert({ professional_id: pro.id, customer_id: user.id });
    }
    refetchFav();
  };

  const submitQuote = async () => {
    if (!user) { toast.error("Entre para solicitar um orçamento"); return; }
    if (!selectedService || !message.trim()) return toast.error("Escolha um serviço e adicione uma mensagem");
    const { data: qr, error } = await supabase.from("quote_requests").insert({
      customer_id: user.id, service_id: selectedService, professional_id: pro!.id, message,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("conversations").insert({ quote_request_id: qr.id, customer_id: user.id, professional_id: pro!.id });
    toast.success("Pedido de orçamento enviado!");
    setQuoteOpen(false); setMessage(""); setSelectedService(null);
  };

  const submitReview = async () => {
    if (!user || !pro) { toast.error("Entre para avaliar"); return; }
    const { error } = await supabase.from("reviews").insert({
      customer_id: user.id, professional_id: pro.id, rating: newReview.rating, comment: newReview.comment,
    });
    if (error) return toast.error(error.message);
    toast.success("Avaliação enviada!");
    setNewReview({ rating: 5, comment: "" });
    refetchPro();
  };

  if (isLoading || !pro) return (<div className="flex min-h-screen flex-col"><SiteHeader /><main className="container mx-auto flex-1 px-4 py-20 text-center text-muted-foreground">Carregando…</main><SiteFooter /></div>);

  const p: any = pro;
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="relative h-40 w-full bg-hero-gradient md:h-56">
          {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="container relative z-10 mx-auto -mt-20 px-4 pb-16 md:-mt-28 lg:px-[150px]">
          <Card className="shadow-elegant border-none">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="relative -mt-20 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-primary shadow-elegant md:h-36 md:w-36 md:-mt-24">
                  {p.profiles?.avatar_url ? (
                    <img src={p.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl font-bold text-primary-foreground">
                      {(p.profiles?.full_name ?? "?").charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-2 md:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold md:text-3xl">{p.profiles?.full_name}</h1>
                    {p.verified && <BadgeCheck className="h-6 w-6 text-primary-glow" />}
                    {p.premium && <Badge className="bg-gold text-gold-foreground">Premium</Badge>}
                  </div>
                  <div className="mt-1 text-muted-foreground">{p.professional_title}{p.company_name && <> · {p.company_name}</>}</div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {(p.profiles?.city || p.profiles?.state || p.ward) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {[p.profiles?.city, p.profiles?.state].filter(Boolean).join(", ")}
                        {p.ward && ` • Ala ${p.ward}`}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-current" /><span className="font-semibold text-foreground">{Number(p.rating).toFixed(1)}</span> ({p.total_reviews} avaliações)</span>

                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline"><Globe className="mr-1 inline h-4 w-4" />Site</a>}
                    {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline"><Linkedin className="mr-1 inline h-4 w-4" />LinkedIn</a>}
                    {p.instagram && <a href={p.instagram} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline"><Instagram className="mr-1 inline h-4 w-4" />Instagram</a>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-56">
                  {p.profiles?.phone && (
                    <Button 
                      asChild 
                      className="gap-2 bg-[#25D366] text-white hover:bg-[#20ba5a]"
                    >
                      <a 
                        href={`https://wa.me/55${p.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá, te encontrei no LDS Hub e gostaria de um orçamento.")}`} 

                        target="_blank" 
                        rel="noreferrer"
                      >
                        <Phone className="h-4 w-4 fill-current" />
                        Chamar no WhatsApp
                      </a>
                    </Button>
                  )}
                  <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Pedir orçamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Pedir um orçamento</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Serviço</Label>
                          <select className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" value={selectedService ?? ""} onChange={(e) => setSelectedService(e.target.value || null)}>
                            <option value="">Escolha um serviço…</option>
                            {(p.services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                        </div>
                        <div><Label>Mensagem</Label><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Descreva o que você precisa…" /></div>
                        <Button className="w-full" onClick={submitQuote}>Enviar pedido</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" onClick={toggleFav} className="gap-2">
                    <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : ""}`} />
                    {isFav ? "Salvo" : "Salvar"}
                  </Button>
                </div>
              </div>

              {p.description && (<><div className="my-8 h-px bg-border" /><div><h2 className="font-display text-lg font-semibold">Sobre</h2><p className="mt-2 whitespace-pre-line text-muted-foreground">{p.description}</p></div></>)}

              <div className="my-8 h-px bg-border" />
              <h2 className="font-display text-lg font-semibold">Serviços</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(p.services ?? []).map((s: any) => (
                  <Link key={s.id} to="/service/$slug" params={{ slug: s.slug }}>
                    <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-elegant">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold">{s.title}</div>
                          {s.starting_price && <Badge variant="secondary">A partir de R$ {Number(s.starting_price).toFixed(0)}</Badge>}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {(!p.services || p.services.length === 0) && <div className="text-sm text-muted-foreground">Nenhum serviço publicado ainda.</div>}
              </div>

              {p.portfolios?.length > 0 && (<>
                <div className="my-8 h-px bg-border" />
                <h2 className="font-display text-lg font-semibold">Portfólio</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {p.portfolios.map((pf: any, index: number) => (
                    <Card 
                      key={pf.id} 
                      className="group cursor-pointer overflow-hidden border-none transition-all hover:ring-2 hover:ring-primary/50"
                      onClick={() => setActivePhotoIndex(index)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={pf.image_url} 
                            alt={pf.title} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <Badge className="bg-white/90 text-black hover:bg-white">Ver imagem</Badge>
                          </div>
                        </div>
                        <div className="p-3 bg-card">
                          <div className="text-sm font-semibold truncate">{pf.title}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {activePhotoIndex !== null && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
                    <button 
                      onClick={() => setActivePhotoIndex(null)}
                      className="absolute right-6 top-6 text-white/70 transition-colors hover:text-white"
                    >
                      <X className="h-8 w-8" />
                    </button>
                    
                    {activePhotoIndex > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex - 1); }}
                        className="absolute left-4 z-[120] rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 md:left-8"
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </button>
                    )}
                    
                    <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                      <img 
                        src={p.portfolios[activePhotoIndex].image_url} 
                        alt={p.portfolios[activePhotoIndex].title}
                        className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                      />
                      <div className="mt-4 text-center">
                        <h3 className="text-lg font-semibold text-white">{p.portfolios[activePhotoIndex].title}</h3>
                        {p.portfolios[activePhotoIndex].description && (
                          <p className="mt-1 text-sm text-white/70">{p.portfolios[activePhotoIndex].description}</p>
                        )}
                        <div className="mt-2 text-xs text-white/40">
                          {activePhotoIndex + 1} de {p.portfolios.length}
                        </div>
                      </div>
                    </div>
                    
                    {activePhotoIndex < p.portfolios.length - 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex + 1); }}
                        className="absolute right-4 z-[120] rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 md:right-8"
                      >
                        <ChevronRight className="h-8 w-8" />
                      </button>
                    )}
                    
                    <div className="absolute inset-0 -z-10" onClick={() => setActivePhotoIndex(null)} />
                  </div>
                )}
              </>)}

              <div className="my-8 h-px bg-border" />
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Avaliações</h2>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" size="sm">Avaliar profissional</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Deixar uma avaliação</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Nota</Label>
                        <select className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrelas</option>)}
                        </select>
                      </div>
                      <div><Label>Comentário</Label><Textarea rows={4} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Conte sua experiência…" /></div>
                      <Button className="w-full" onClick={submitReview}>Publicar avaliação</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mt-4 space-y-3">
                {(p.reviews ?? []).map((r: any) => (
                  <Card key={r.id}><CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{r.profiles?.full_name ?? "Cliente"}</div>
                      <div className="flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-current" /><span className="text-sm font-semibold text-foreground">{r.rating}</span></div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                  </CardContent></Card>
                ))}
                {(!p.reviews || p.reviews.length === 0) && <div className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</div>}
              </div>
            </CardContent>
          </Card>
        </div>
        {p.profiles?.phone && (
          <a
            href={`https://wa.me/55${p.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá, te encontrei no LDS Hub e gostaria de um orçamento.")}`}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:scale-110 active:scale-95 md:h-16 md:w-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
            title="Chamar no WhatsApp"
          >
            <Phone className="h-7 w-7 fill-current md:h-8 md:w-8" />
          </a>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
