import { Link } from "@tanstack/react-router";
import { Share2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto px-4 lg:px-[150px] py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="font-display text-lg font-bold flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground">
                <Share2 className="h-3.5 w-3.5" />
              </span>
              <span>LDS <span className="text-primary-glow">Hub</span></span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              O marketplace de serviços profissionais para membros de A Igreja de Jesus Cristo dos Santos dos Últimos Dias.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Marketplace</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse">Encontrar profissionais</Link></li>
              <li><Link to="/categories">Categorias</Link></li>
              <li><Link to="/become-pro">Oferecer serviços</Link></li>
              <li><Link to="/pricing">Gratuito</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Empresa</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about">Sobre</Link></li>
              <li><Link to="/how-it-works">Como funciona</Link></li>
              <li><Link to="/faq">Perguntas frequentes</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Legal</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms">Termos</Link></li>
              <li><Link to="/privacy">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-[10px] leading-relaxed text-muted-foreground/60 mb-6 max-w-4xl">
            <strong>Aviso Legal:</strong> O LDS Hub é uma plataforma independente e não oficial. Não somos afiliados, associados, autorizados, endossados por, ou de qualquer forma oficialmente conectados a A Igreja de Jesus Cristo dos Santos dos Últimos Dias, ou qualquer uma de suas subsidiárias ou afiliadas.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} LDS Hub. Feito pela comunidade e para a comunidade.</p>
            <p>
              Desenvolvido por{" "}
              <a 
                href="https://blinky.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline transition-colors"
              >
                Blinky
              </a>
            </p>
          </div>
        </div>


      </div>
    </footer>
  );
}
