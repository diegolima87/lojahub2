import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Gratuito — LDS Hub" }, { name: "description", content: "LDS Hub é gratuito para todos os profissionais." }] }),
  component: () => (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="bg-subtle-gradient flex-1">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-4xl font-bold tracking-tight">100% Gratuito</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Nossa missão é fortalecer a comunidade. Por isso, o LDS Hub é totalmente gratuito para profissionais e clientes. Sem taxas de cadastro, sem mensalidades.
            </p>
          </div>
          
          <div className="mx-auto mt-12 grid max-w-lg gap-6">
            <Card className="border-primary/20 shadow-elegant relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-primary" />
              <CardContent className="p-10 text-center">
                <div className="text-sm font-semibold uppercase tracking-wide text-primary">Plano Comunidade</div>
                <div className="mt-4 font-display text-5xl font-bold text-primary">Grátis</div>
                <p className="mt-2 text-muted-foreground">Para sempre</p>
                
                <ul className="mx-auto mt-8 max-w-xs space-y-4 text-left text-sm">
                  {[
                    "Perfil profissional completo",
                    "Listagem em várias categorias",
                    "Receba pedidos de orçamento ilimitados",
                    "Chat direto com clientes",
                    "Avaliações e recomendações",
                    "Sem custos ocultos"
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="grid h-5 w-5 place-items-center rounded-full bg-success/10 text-success">
                        <Check className="h-3 w-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <Button asChild size="lg" className="mt-10 w-full"><Link to="/become-pro">Começar agora</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main><SiteFooter /></div>
  ),
});
