import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  User,
  Briefcase,
  Image as ImageIcon,
  ShieldCheck,
  Settings,
  Lock,
  Sparkles,
  LogOut,
  ChevronUp,
  Share2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Item = { title: string; url: string; icon: any };

const clientItems: Item[] = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Orçamentos", url: "/dashboard/quotes", icon: FileText },
  { title: "Mensagens", url: "/messages", icon: MessageSquare },
  { title: "Favoritos", url: "/favorites", icon: Heart },
];

const proItems: Item[] = [
  { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
  { title: "Serviços", url: "/dashboard/services", icon: Briefcase },
  { title: "Portfólio", url: "/dashboard/portfolio", icon: ImageIcon },
  { title: "Verificação", url: "/dashboard/verification", icon: ShieldCheck },
];

const accountItems: Item[] = [
  { title: "Dados da Conta", url: "/dashboard/account", icon: Settings },
  { title: "Segurança", url: "/dashboard/security", icon: Lock },
];

export function DashboardSidebar({ isPro }: { isPro: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, signOut, roles } = useAuth();
  const isAdmin = roles.includes("admin");

  const { data: profile } = useQuery({
    queryKey: ["sidebar-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-2 py-4">
        <Link to="/" className="flex items-center gap-2 px-2 font-display font-bold tracking-tight">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Share2 className="h-4 w-4" />
          </span>
          <span className="truncate group-data-[collapsible=icon]:hidden">
            LDS <span className="text-primary-glow">Hub</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isPro ? (
          <SidebarGroup>
            <SidebarGroupLabel>Profissional</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {proItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent className="px-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Seja profissional
                </div>
                <p className="mt-1 text-muted-foreground">
                  Cadastre-se para oferecer seus serviços.
                </p>
                <Button asChild size="sm" className="mt-2 w-full">
                  <Link to="/become-pro">Começar</Link>
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Painel Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? ""} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {profile?.full_name?.charAt(0) ?? user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="w-full truncate text-sm font-medium">
                      {profile?.full_name ?? user?.email?.split("@")[0]}
                    </span>
                    <span className="w-full truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56"
              >
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/account" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => {
                    signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
