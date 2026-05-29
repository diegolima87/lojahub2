import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Segurança — LDS Hub" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  const navigate = useNavigate();

  const signOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) return toast.error(error.message);
    toast.success("Você saiu de todos os dispositivos");
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Segurança</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proteja seu acesso e gerencie suas sessões.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" /> Sessões ativas
          </CardTitle>
          <CardDescription>
            Sua conta pode estar conectada em vários dispositivos. Você pode desconectar todas as
            sessões a qualquer momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOutAll}>
            <LogOut className="mr-2 h-4 w-4" /> Sair de todos os dispositivos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dicas de segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use uma senha única e forte (mín. 8 caracteres com letras, números e símbolos).</p>
          <p>• Nunca compartilhe seu acesso com outras pessoas.</p>
          <p>• Sempre saia em computadores públicos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
