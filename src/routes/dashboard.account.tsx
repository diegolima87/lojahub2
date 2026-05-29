import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, KeyRound, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/account")({
  head: () => ({ meta: [{ title: "Dados da Conta — LDS Hub" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loadingReset, setLoadingReset] = useState(false);
  const [confirm, setConfirm] = useState("");

  const sendReset = async () => {
    if (!user?.email) return;
    setLoadingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoadingReset(false);
    if (error) return toast.error(error.message);
    toast.success("E-mail de redefinição enviado!");
  };

  const deleteAccount = async () => {
    if (confirm !== "EXCLUIR") return toast.error("Digite EXCLUIR para confirmar");
    toast.error("Para excluir sua conta, entre em contato com o suporte.");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Dados da Conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie acesso e dados de login.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" /> E-mail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={user?.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">
            Para alterar o e-mail, entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> Senha
          </CardTitle>
          <CardDescription>Envie um link por e-mail para redefinir sua senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={sendReset} disabled={loadingReset}>
            {loadingReset ? "Enviando…" : "Enviar link de redefinição"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" /> Excluir conta
          </CardTitle>
          <CardDescription>
            Esta ação não pode ser desfeita. Todos os seus dados serão removidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-xs">
            Digite <b>EXCLUIR</b> para confirmar
          </Label>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="EXCLUIR" />
          <Button variant="destructive" onClick={deleteAccount}>
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm">Sair da sua conta neste navegador</span>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
