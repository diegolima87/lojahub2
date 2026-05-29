import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/portfolio")({
  head: () => ({ meta: [{ title: "Portfólio — LDS Hub" }] }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { user } = useAuth();
  const [pro, setPro] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ title: "", description: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      setPro(p);
      if (p) {
        const { data } = await supabase
          .from("portfolios")
          .select("*")
          .eq("professional_id", p.id)
          .order("created_at");
        setItems(data ?? []);
      }
    })();
  }, [user]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolios").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolios").getPublicUrl(path);
    setNewItem({ ...newItem, image_url: publicUrl });
    setUploading(false);
  };

  const add = async () => {
    if (!pro || !newItem.image_url || !newItem.title) return;
    if (items.length >= 10) return toast.error("Limite máximo de 10 fotos atingido");
    const { data, error } = await supabase
      .from("portfolios")
      .insert({ ...newItem, professional_id: pro.id })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setItems([...items, data]);
    setNewItem({ title: "", description: "", image_url: "" });
    setOpen(false);
    toast.success("Adicionado ao portfólio");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    await supabase.from("portfolios").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Portfólio</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length}/10 itens</p>
        </div>
        {items.length < 10 && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Imagem</Label>
                  <div className="mt-1 flex items-center gap-3">
                    {newItem.image_url && (
                      <img src={newItem.image_url} className="h-12 w-12 rounded object-cover" />
                    )}
                    <Label className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Enviando..." : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={upload}
                        disabled={uploading}
                      />
                    </Label>
                  </div>
                </div>
                <Button onClick={add} className="w-full" disabled={!newItem.image_url || !newItem.title}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.id} className="group overflow-hidden">
            <div className="relative aspect-video">
              <img src={i.image_url} alt={i.title} className="h-full w-full object-cover" />
              <button
                onClick={() => remove(i.id)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="p-3">
              <div className="font-semibold text-sm">{i.title}</div>
              {i.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              Nenhum item ainda. Clique em Adicionar para começar.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
