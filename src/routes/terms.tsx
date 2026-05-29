import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Termos de Uso — LDS Hub" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16 max-w-4xl">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-xl">
          <div className="flex items-center gap-3 text-amber-800">
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <h2 className="font-display font-bold text-lg">Aviso de Não Oficialidade</h2>
          </div>
          <p className="mt-2 text-amber-700 text-sm leading-relaxed">
            O LDS Hub é uma iniciativa independente. 
            <strong> Não possuímos qualquer vínculo oficial com A Igreja de Jesus Cristo dos Santos dos Últimos Dias.</strong> 
            O uso de termos relacionados à comunidade visa apenas identificar o público-alvo e não implica endosso institucional.
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-8">Termos de Uso</h1>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar o LDS Hub, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar a plataforma.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. Natureza da Plataforma</h2>
            <p>O LDS Hub é um diretório de profissionais que busca conectar membros da comunidade para a prestação de serviços. Atuamos apenas como ponte de conexão e não garantimos a qualidade, legalidade ou segurança dos serviços prestados pelos profissionais listados.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Conduta do Usuário</h2>
            <p>Você concorda em usar a plataforma de forma ética, respeitosa e legal. É proibido:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Fornecer informações falsas ou enganosas.</li>
              <li>Assediar, difamar ou abusar de outros membros da comunidade.</li>
              <li>Usar a plataforma para fins ilegais ou não autorizados.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">4. Responsabilidades</h2>
            <p>A responsabilidade por qualquer transação, contrato ou serviço é exclusivamente entre o Profissional e o Cliente. O LDS Hub não se responsabiliza por perdas, danos ou disputas decorrentes de interações iniciadas na plataforma.</p>
          </section>

          <section className="mb-10 bg-slate-50 p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">5. Esclarecimento Importante</h2>
            <p>Este site é de propriedade e operação privada. Não é um site oficial de A Igreja de Jesus Cristo dos Santos dos Últimos Dias. Todas as opiniões e serviços aqui expressos são de responsabilidade de seus respectivos autores e prestadores.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">6. Modificações</h2>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado da plataforma após as mudanças constitui aceitação dos novos termos.</p>
          </section>

          <p className="mt-12 text-sm text-muted-foreground italic">Última atualização: 29 de Maio de 2026</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
