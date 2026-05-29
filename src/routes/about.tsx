import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function makeStub(title: string, body: string) {
  return () => (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-muted-foreground">{body}</p>
      </main><SiteFooter /></div>
  );
}

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Sobre — LDS Hub" }] }),
  component: makeStub("Sobre o LDS Hub", "O LDS Hub é o marketplace de confiança para membros de A Igreja de Jesus Cristo dos Santos dos Últimos Dias encontrarem e oferecerem serviços profissionais."),
});
