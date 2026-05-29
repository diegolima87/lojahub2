import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/dashboard/services")({
  head: () => ({ meta: [{ title: "Meus serviços — LDS Hub" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", category_id: "", starting_price: "", online: true, presential: true, cover_url: "" });
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setForm({ title: "", description: "", category_id: "", starting_price: "", online: true, presential: true, cover_url: "" });
    setEditingService(null);
  };

  const { data: pro } = useQuery({ queryKey: ["my-pro-svc", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("professionals").select("id").eq("user_id", user!.id).maybeSingle()).data });
  const { data: cats } = useQuery({ queryKey: ["all-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [] });
  const { data: services, refetch } = useQuery({
    queryKey: ["my-services", pro?.id], enabled: !!pro,
    queryFn: async () => (await supabase.from("services").select("*, categories(name)").eq("professional_id", pro!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!user) return (<div className="py-20 text-center"><Button asChild><Link to="/login">Entrar</Link></Button></div>);
  if (!pro) return (<div className="py-20 text-center"><h1 className="font-display text-2xl font-bold">Crie seu perfil profissional primeiro</h1><Button asChild className="mt-6"><Link to="/become-pro">Tornar-se profissional</Link></Button></div>);

  const save = async () => {
    if (!form.title || !form.description || !form.category_id) return toast.error("Preencha todos os campos obrigatórios");
    
    const payload = {
      title: form.title,
      description: form.description,
      category_id: form.category_id,
      starting_price: form.starting_price ? Number(form.starting_price) : null,
      online_service: form.online,
      presential_service: form.presential,
      cover_url: form.cover_url,
    };

    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingService.id);
      
      if (error) return toast.error(error.message);
      toast.success("Serviço atualizado");
    } else {
      const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`;
      const { error } = await supabase
        .from("services")
        .insert({ ...payload, professional_id: pro.id, slug });
      
      if (error) return toast.error(error.message);
      toast.success("Serviço criado");
    }

    setOpen(false);
    resetForm();
    refetch();
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      category_id: service.category_id,
      starting_price: service.starting_price?.toString() || "",
      online: service.online_service,
      presential: service.presential_service,
      cover_url: service.cover_url || "",
    });
    setOpen(true);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/service-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolios").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("portfolios").getPublicUrl(path);
    setForm({ ...form, cover_url: publicUrl });
    setUploading(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Meus serviços</h1>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo serviço</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{editingService ? "Editar serviço" : "Criar um serviço"}</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div>
                <Label>Imagem de capa</Label>
                <div className="mt-2 flex flex-col gap-3">
                  {form.cover_url && (
                    <img src={form.cover_url} alt="" className="aspect-video w-full rounded-md object-cover" />
                  )}
                  <Label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando…" : "Escolher imagem"}
                    <input type="file" className="hidden" accept="image/*" onChange={uploadCover} disabled={uploading} />
                  </Label>
                </div>
              </div>
              <div><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Categoria *</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Escolha…" /></SelectTrigger>
                  <SelectContent>{(cats ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Descrição *</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Preço inicial (R$)</Label><Input type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} /></div>
              <Button onClick={save} className="w-full">{editingService ? "Atualizar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(services ?? []).map((s: any) => (
          <Card key={s.id}><CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.categories?.name}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit2 className="h-4 w-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
          </CardContent></Card>
        ))}
        {(!services || services.length === 0) && <Card className="md:col-span-2"><CardContent className="p-12 text-center text-muted-foreground">Nenhum serviço ainda — crie o seu primeiro.</CardContent></Card>}
      </div>
    </div>
  );
}
