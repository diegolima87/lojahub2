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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — LDS Hub" }, { name: "description", content: "Entre no LDS Hub." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard" });
  };


  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="bg-subtle-gradient flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="p-8">
            <h1 className="font-display text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Entre na sua conta LDS Hub.</p>
            <form onSubmit={handleEmail} className="space-y-4">
              <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="password">Senha</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">Não tem conta? <Link to="/signup" className="font-semibold text-primary hover:underline">Crie uma</Link></p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
