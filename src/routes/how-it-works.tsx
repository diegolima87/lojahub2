import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Star, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "Como funciona — LDS Hub" }] }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-mesh-navy py-24 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-5xl font-extrabold tracking-tight">Como o LDS Hub funciona</h1>
            <p className="mt-6 text-xl text-blue-100/70 max-w-2xl mx-auto">
              Uma plataforma simples para conectar quem precisa de um serviço com quem sabe fazer, dentro de uma rede baseada em valores.
            </p>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { icon: Search, title: "1. Encontre", desc: "Use nossa busca avançada para encontrar especialistas em diversas áreas, de advogados a encanadores." },
              { icon: MessageSquare, title: "2. Conecte-se", desc: "Inicie uma conversa, tire dúvidas e peça orçamentos diretamente pelo nosso sistema ou WhatsApp." },
              { icon: Star, title: "3. Avalie", desc: "Após o serviço, deixe sua avaliação para ajudar outros membros a encontrar os melhores profissionais." }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-3xl border border-border bg-card shadow-premium text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-6">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-24 max-w-4xl mx-auto p-10 rounded-3xl bg-slate-50 border border-slate-200">
            <h2 className="text-3xl font-bold mb-6 text-center">Para Profissionais</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                "Crie um perfil detalhado com portfólio",
                "Receba pedidos de orçamento no seu painel",
                "Construa sua reputação com avaliações reais",
                "Aumente sua visibilidade na comunidade"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild size="lg" className="rounded-full px-10">
                <Link to="/signup">Cadastrar meus serviços</Link>
              </Button>
            </div>

          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
