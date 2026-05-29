import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Quem pode participar do LDS Hub?", a: "Membros de A Igreja de Jesus Cristo dos Santos dos Últimos Dias podem participar como clientes ou como profissionais de serviços." },
  { q: "É gratuito para usar?", a: "Sim. Navegar e contratar são sempre gratuitos. Para profissionais, a plataforma também é 100% gratuita para publicar e oferecer serviços." },
  { q: "Como o LDS Hub se mantém?", a: "O LDS Hub é um projeto focado em fortalecer a comunidade e facilitar conexões profissionais entre membros." },
  { q: "Como os profissionais são verificados?", a: "Profissionais podem enviar documentos para verificação manual e receber um selo de Verificado em seu perfil." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — LDS Hub" }] }),
  component: () => (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight">Perguntas frequentes</h1>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f, i) => (<AccordionItem key={i} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>))}
        </Accordion>
      </main><SiteFooter /></div>
  ),
});
