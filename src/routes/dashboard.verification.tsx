import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/verification")({
  head: () => ({ meta: [{ title: "Verificação — LDS Hub" }] }),
  component: VerificationPage,
});

function VerificationPage() {
  const { user } = useAuth();
  const [pro, setPro] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("professionals")
        .select("*, portfolios(count)")
        .eq("user_id", user.id)
        .maybeSingle();
      const { data: pr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setPro(p);
      setProfile(pr);
    })();
  }, [user]);

  const request = async () => {
    if (!pro) return;
    const { error } = await supabase
      .from("professionals")
      .update({ verification_status: "pending" })
      .eq("id", pro.id);
    if (error) return toast.error(error.message);
    setPro({ ...pro, verification_status: "pending" });
    toast.success("Solicitação enviada!");
  };

  if (!pro)
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Você precisa ter um perfil profissional.</p>
          <Button asChild className="mt-4">
            <Link to="/become-pro">Tornar-se profissional</Link>
          </Button>
        </CardContent>
      </Card>
    );

  const checks = [
    { label: "Telefone cadastrado", done: !!profile?.phone },
    { label: "Foto de perfil", done: !!profile?.avatar_url },
    { label: "Cidade e estado", done: !!profile?.city },
    { label: "Ala definida", done: !!pro.ward },
    { label: "Descrição preenchida", done: !!pro.description && pro.description.length > 50 },
    { label: "Portfólio com itens", done: (pro.portfolios?.[0]?.count ?? 0) > 0 },
  ];
  const ready = checks.every((c) => c.done);
  const status = pro.verification_status ?? "unverified";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Verificação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ganhe o selo de verificado e aumente sua credibilidade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Status atual
            </span>
            {status === "verified" && <Badge className="bg-emerald-500">Verificado</Badge>}
            {status === "pending" && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                <Clock className="mr-1 h-3 w-3" /> Em análise
              </Badge>
            )}
            {status === "unverified" && (
              <Badge variant="outline">
                <AlertCircle className="mr-1 h-3 w-3" /> Não verificado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "verified" ? (
            <p className="text-sm text-muted-foreground">
              Parabéns! Seu perfil está verificado e aparece em destaque.
            </p>
          ) : status === "pending" ? (
            <p className="text-sm text-muted-foreground">
              Sua solicitação está em análise. Você receberá uma notificação quando for aprovada.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Para solicitar a verificação, complete os requisitos abaixo:
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    {c.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                    )}
                    <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={request} disabled={!ready} className="mt-6">
                Solicitar verificação
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
