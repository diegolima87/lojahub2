import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { maskPhone } from "@/lib/utils";
import { states, fetchCities } from "@/lib/location";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Editar perfil — LDS Hub" }] }),
  component: ProfileEdit,
});

function ProfileEdit() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pro, setPro] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["cats-prof-edit"],
    queryFn: async () =>
      (await supabase.from("categories").select("*").eq("active", true).order("name")).data ?? [],
  });

  useEffect(() => {
    if (profile?.state) fetchCities(profile.state).then(setCities);
    else setCities([]);
  }, [profile?.state]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const { data: pr } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(p);
      setPro(pr);
    })();
  }, [user]);

  const saveIdentity = async () => {
    if (!user) return;
    setSaving("identity");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
      .eq("id", user.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Identidade salva");
  };

  const saveContact = async () => {
    if (!user) return;
    setSaving("contact");
    const { error } = await supabase
      .from("profiles")
      .update({ phone: profile.phone })
      .eq("id", user.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Contato salvo");
  };

  const saveLocation = async () => {
    if (!user) return;
    setSaving("location");
    const { error } = await supabase
      .from("profiles")
      .update({ state: profile.state, city: profile.city })
      .eq("id", user.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Localização salva");
  };

  const saveWard = async () => {
    if (!pro) return;
    setSaving("ward");
    const { error } = await supabase
      .from("professionals")
      .update({ ward: pro.ward })
      .eq("id", pro.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Ala salva");
  };

  const saveProfessional = async () => {
    if (!pro) return;
    setSaving("pro");
    const { error } = await supabase
      .from("professionals")
      .update({
        category_id: pro.category_id,
        professional_title: pro.professional_title,
        company_name: pro.company_name,
        description: pro.description,
        years_experience: pro.years_experience,
        website: pro.website,
        linkedin: pro.linkedin,
        instagram: pro.instagram,
      })
      .eq("id", pro.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Informações profissionais salvas");
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    const path = `${user.id}/avatar-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolios").upload(path, file);
    if (error) {
      toast.error(error.message);
      setAvatarUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolios").getPublicUrl(path);
    
    // Auto-save the avatar_url to the database immediately
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Erro ao salvar foto no perfil: " + updateError.message);
    } else {
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Foto de perfil atualizada");
    }
    
    setAvatarUploading(false);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !pro) return;
    setCoverUploading(true);
    const path = `${user.id}/cover-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolios").upload(path, file);
    if (error) {
      toast.error(error.message);
      setCoverUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("portfolios").getPublicUrl(path);
    
    const { error: updateError } = await supabase
      .from("professionals")
      .update({ cover_url: publicUrl })
      .eq("id", pro.id);

    if (updateError) {
      toast.error("Erro ao salvar capa: " + updateError.message);
    } else {
      setPro({ ...pro, cover_url: publicUrl });
      toast.success("Capa do perfil atualizada");
    }
    setCoverUploading(false);
  };


  if (!profile) return null;

  return (
    <div className="max-w-3xl space-y-6">
      {pro && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capa do perfil</CardTitle>
            <CardDescription>Esta imagem aparecerá no topo do seu perfil público.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg bg-accent">
              {pro.cover_url ? (
                <img src={pro.cover_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">
                  Sem imagem de capa
                </div>
              )}
            </div>
            <Label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
              <Upload className="h-4 w-4" />
              {coverUploading ? "Enviando…" : pro.cover_url ? "Trocar capa" : "Adicionar capa"}
              <input type="file" className="hidden" accept="image/*" onChange={uploadCover} disabled={coverUploading} />
            </Label>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Meu Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mantenha suas informações atualizadas. Cada bloco é salvo separadamente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto e identidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-accent">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-2xl font-bold">
                  {profile.full_name?.charAt(0) ?? "?"}
                </div>
              )}
            </div>
            <Label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
              <Upload className="h-4 w-4" />
              {avatarUploading ? "Enviando…" : "Trocar foto"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={avatarUploading}
              />
            </Label>
          </div>
          <div>
            <Label>Nome completo</Label>
            <Input
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={profile.email ?? user?.email ?? ""} disabled />
          </div>
          <Button onClick={saveIdentity} disabled={saving === "identity"}>
            {saving === "identity" ? "Salvando…" : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: maskPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <Button onClick={saveContact} disabled={saving === "contact"}>
            {saving === "contact" ? "Salvando…" : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estado</Label>
              <Select
                value={profile.state ?? ""}
                onValueChange={(v) => setProfile({ ...profile, state: v, city: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Select
                value={profile.city ?? ""}
                onValueChange={(v) => setProfile({ ...profile, city: v })}
                disabled={!profile.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveLocation} disabled={saving === "location"}>
            {saving === "location" ? "Salvando…" : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      {pro && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Membro da Igreja</CardTitle>
              <CardDescription>
                Ala que você frequenta — usada na busca avançada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ala</Label>
                <Input
                  value={pro.ward ?? ""}
                  onChange={(e) => setPro({ ...pro, ward: e.target.value })}
                  placeholder="Ex: Ala Campo Grande"
                />
              </div>
              <Button onClick={saveWard} disabled={saving === "ward"}>
                {saving === "ward" ? "Salvando…" : "Salvar"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Categoria principal</Label>
                <Select
                  value={pro.category_id ?? ""}
                  onValueChange={(v) => setPro({ ...pro, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={pro.professional_title ?? ""}
                    onChange={(e) => setPro({ ...pro, professional_title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={pro.company_name ?? ""}
                    onChange={(e) => setPro({ ...pro, company_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Anos de experiência</Label>
                <Input
                  type="number"
                  value={pro.years_experience ?? 0}
                  onChange={(e) =>
                    setPro({ ...pro, years_experience: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Sobre você</Label>
                <Textarea
                  rows={4}
                  value={pro.description ?? ""}
                  onChange={(e) => setPro({ ...pro, description: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Site</Label>
                  <Input
                    value={pro.website ?? ""}
                    onChange={(e) => setPro({ ...pro, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={pro.linkedin ?? ""}
                    onChange={(e) => setPro({ ...pro, linkedin: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={pro.instagram ?? ""}
                    onChange={(e) => setPro({ ...pro, instagram: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={saveProfessional} disabled={saving === "pro"}>
                {saving === "pro" ? "Salvando…" : "Salvar"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {!pro && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Você ainda não é profissional.{" "}
            <Link to="/become-pro" className="text-primary hover:underline">
              Cadastrar perfil profissional
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
