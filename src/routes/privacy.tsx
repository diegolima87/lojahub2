import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Política de Privacidade — LDS Hub" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
            O LDS Hub é um projeto independente criado por membros da comunidade para a comunidade. 
            <strong> Não somos um site, ferramenta ou representação oficial de A Igreja de Jesus Cristo dos Santos dos Últimos Dias.</strong> 
            Este site não é mantido, endossado ou afiliado à Igreja.
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-8">Política de Privacidade</h1>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
            <p>O LDS Hub ("nós") leva a sério a sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nossa plataforma.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. Informações que Coletamos</h2>
            <p>Coletamos informações que você nos fornece diretamente ao criar uma conta, como:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Nome completo e e-mail.</li>
              <li>Informações profissionais (título, empresa, descrição).</li>
              <li>Localização (Cidade e Estado).</li>
              <li>Fotos e itens de portfólio.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Uso das Informações</h2>
            <p>Utilizamos os dados coletados para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Operar e manter a plataforma de conexão.</li>
              <li>Permitir que clientes encontrem profissionais.</li>
              <li>Melhorar a experiência do usuário e a segurança da comunidade.</li>
              <li>Comunicar atualizações importantes sobre sua conta.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">4. Compartilhamento de Dados</h2>
            <p>Seus dados profissionais e de contato (quando fornecidos voluntariamente) são públicos para outros usuários da plataforma. Não vendemos seus dados pessoais a terceiros.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">5. Seus Direitos</h2>
            <p>Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento através das configurações do seu painel de controle.</p>
          </section>

          <section className="mb-10 bg-slate-50 p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">6. Isenção de Responsabilidade Oficial</h2>
            <p>Reiteramos que o LDS Hub é uma plataforma comunitária independente. Ao utilizar este site, você reconhece que está interagindo com uma ferramenta não oficial, criada por iniciativa privada, e não com um canal de comunicação da Igreja de Jesus Cristo dos Santos dos Últimos Dias.</p>
          </section>

          <p className="mt-12 text-sm text-muted-foreground italic">Última atualização: 29 de Maio de 2026</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
