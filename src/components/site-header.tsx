import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, LayoutDashboard, LogOut, MessageSquare, Search, UserCircle, Share2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const isPro = roles.includes("professional");
  const isAdmin = roles.includes("admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 lg:px-[150px]">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-premium">
            <Share2 className="h-5 w-5" />
          </span>
          <span>LDS <span className="text-primary-glow">Hub</span></span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/browse" className="transition-colors hover:text-foreground">Explorar</Link>
          <Link to="/categories" className="transition-colors hover:text-foreground">Categorias</Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">Gratuito</Link>
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">Como funciona</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/browse" })} className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          {!user ? (
            <>
              <Button variant="ghost" asChild><Link to="/login">Entrar</Link></Button>
              <Button asChild><Link to="/signup">Começar</Link></Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Painel</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/favorites"><Heart className="mr-2 h-4 w-4" />Favoritos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/messages"><MessageSquare className="mr-2 h-4 w-4" />Mensagens</Link></DropdownMenuItem>
                {!isPro && (
                  <DropdownMenuItem asChild><Link to="/become-pro"><Briefcase className="mr-2 h-4 w-4" />Seja um profissional</Link></DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { signOut(); navigate({ to: "/" }); }}>
                  <LogOut className="mr-2 h-4 w-4" />Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
