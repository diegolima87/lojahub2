import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { useQuery } from "@tanstack/react-query";
import { states, fetchCities } from "@/lib/location";
import { useEffect } from "react";



export const Route = createFileRoute("/become-pro")({
  head: () => ({ meta: [{ title: "Seja um profissional — LDS Hub" }] }),
  component: BecomePro,
});

function BecomePro() {
  const { user, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: "", 
    company: "", 
    description: "", 
    years: 0, 
    website: "", 
    linkedin: "", 
    instagram: "",
    categoryId: "",
    ward: "",
    state: "",
    city: ""
  });

  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.state) {
      fetchCities(form.state).then(setCities);
    } else {
      setCities([]);
    }
  }, [form.state]);


  const { data: categories } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("active", true).order("name");
      return data ?? [];
    },
  });

  if (!user) return (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Entre para criar seu perfil profissional</h1>
        <Button asChild className="mt-6"><Link to="/signup">Criar conta</Link></Button>
      </main><SiteFooter /></div>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) return toast.error("Por favor, selecione uma categoria.");
    if (!form.ward.trim()) return toast.error("Por favor, informe a qual Ala você pertence.");
    if (!form.state) return toast.error("Por favor, selecione seu estado.");
    if (!form.city) return toast.error("Por favor, selecione sua cidade.");

    setLoading(true);

    const baseSlug = slugify(form.title + "-" + (user.email?.split("@")[0] ?? ""));
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    
    // Update profile with location data
    await supabase.from("profiles").update({
      state: form.state,
      city: form.city,
    }).eq("id", user.id);

    // Insert professional with category_id

    const { data: pro, error } = await supabase.from("professionals").insert({
      user_id: user.id, 
      professional_title: form.title, 
      company_name: form.company || null,
      description: form.description, 
      years_experience: Number(form.years) || 0,
      website: form.website || null, 
      linkedin: form.linkedin || null, 
      instagram: form.instagram || null, 
      category_id: form.categoryId,
      ward: form.ward,
      slug,

    }).select().single();

    if (error) { setLoading(false); return toast.error(error.message); }

    // Also create a default service in that category so they appear in browse
    if (pro) {
      await supabase.from("services").insert({
        professional_id: pro.id,
        category_id: form.categoryId,
        title: form.title,
        description: form.description,
        status: "active" as any,
        slug: `${pro.slug}-servico`,
      });
    }

    await supabase.from("user_roles").insert({ user_id: user.id, role: "professional" });
    await refreshRoles();
    setLoading(false);
    toast.success("Bem-vindo a bordo!");
    navigate({ to: "/dashboard" });
  };


  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="bg-subtle-gradient flex-1 pb-20">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center animate-fade-up">
            <h1 className="font-display text-4xl font-extrabold tracking-tight">Crie seu perfil profissional</h1>
            <p className="mt-2 text-lg text-muted-foreground">Mostre seu talento para toda a comunidade.</p>
          </div>
          
          <Card className="overflow-hidden border-none shadow-premium animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="h-2 bg-primary" />
            <CardContent className="p-8 md:p-12">
              <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categoria Principal *</Label>
                    <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                      <SelectTrigger className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary">
                        <SelectValue placeholder="O que você faz?" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Título Profissional *</Label>
                    <Input 
                      required 
                      className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary"
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value })} 
                      placeholder="ex: Advogado de Família" 
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ala que Pertence *</Label>
                    <Input 
                      required 
                      className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary"
                      value={form.ward} 
                      onChange={(e) => setForm({ ...form, ward: e.target.value })} 
                      placeholder="Nome da sua Ala" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Empresa / Consultório</Label>
                    <Input 
                      className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary"
                      value={form.company} 
                      onChange={(e) => setForm({ ...form, company: e.target.value })} 
                      placeholder="Nome do seu negócio (opcional)"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estado *</Label>
                    <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v, city: "" })}>
                      <SelectTrigger className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cidade *</Label>
                    <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })} disabled={!form.state}>
                      <SelectTrigger className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary">
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>

                    </Select>
                  </div>
                </div>



                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sobre Você / Biografia</Label>
                  <Textarea 
                    rows={5} 
                    className="resize-none rounded-xl bg-accent/50 border-accent focus:ring-primary"
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    placeholder="Conte sobre sua experiência, especialidades e o que te diferencia dos outros profissionais." 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anos de experiência</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    className="h-12 rounded-xl bg-accent/50 border-accent focus:ring-primary w-32"
                    value={form.years} 
                    onChange={(e) => setForm({ ...form, years: Number(e.target.value) })} 
                  />
                </div>

                <div className="pt-4 border-t border-border mt-8">
                  <h3 className="font-display font-bold mb-4">Presença Digital</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">Site</Label>
                      <Input 
                        className="rounded-lg bg-accent/30 border-accent"
                        value={form.website} 
                        onChange={(e) => setForm({ ...form, website: e.target.value })} 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">LinkedIn</Label>
                      <Input 
                        className="rounded-lg bg-accent/30 border-accent"
                        value={form.linkedin} 
                        onChange={(e) => setForm({ ...form, linkedin: e.target.value })} 
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">Instagram</Label>
                      <Input 
                        className="rounded-lg bg-accent/30 border-accent"
                        value={form.instagram} 
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })} 
                        placeholder="@seuusuario"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-navy transition-all hover:scale-[1.01] active:scale-[0.99] mt-8" 
                  disabled={loading}
                >
                  {loading ? "Criando seu perfil..." : "Finalizar cadastro profissional"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );

}
