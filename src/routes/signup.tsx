import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maskPhone } from "@/lib/utils";
import { states, fetchCities } from "@/lib/location";
import { useEffect } from "react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — LDS Hub" }, { name: "description", content: "Junte-se ao LDS Hub." }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", city: "", state: "" });
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.state) {
      fetchCities(form.state).then(setCities);
    } else {
      setCities([]);
    }
  }, [form.state]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = k === "phone" ? maskPhone(e.target.value) : e.target.value;
    setForm({ ...form, [k]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/dashboard" },
    });
    if (error) { setLoading(false); return toast.error(error.message); }
    if (data.user) {
      await supabase.from("profiles").update({
        full_name: fullName, phone: form.phone, city: form.city, state: form.state,
      }).eq("id", data.user.id);
    }
    setLoading(false);
    toast.success("Conta criada!");
    navigate({ to: "/dashboard" });
  };


  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="bg-subtle-gradient flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg shadow-elegant">
          <CardContent className="p-8">
            <h1 className="font-display text-2xl font-bold">Junte-se ao LDS Hub</h1>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua conta em segundos.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nome</Label><Input required value={form.firstName} onChange={update("firstName")} /></div>
                <div><Label>Sobrenome</Label><Input required value={form.lastName} onChange={update("lastName")} /></div>
              </div>
              <div><Label>E-mail</Label><Input type="email" required value={form.email} onChange={update("email")} /></div>
              <div><Label>Telefone</Label><Input type="tel" value={form.phone} onChange={update("phone")} placeholder="(00) 00000-0000" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Estado</Label>
                  <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v, city: "" })}>
                    <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })} disabled={!form.state}>
                    <SelectTrigger><SelectValue placeholder="Cidade" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Senha</Label><Input type="password" required minLength={8} value={form.password} onChange={update("password")} /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">Já tem conta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link></p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
