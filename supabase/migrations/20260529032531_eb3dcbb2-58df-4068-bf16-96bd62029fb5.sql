-- Adicionar colunas de controle aos profissionais
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified', -- unverified, pending, verified, rejected
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved'; -- approved, flagged, banned

-- Criar bucket se não existir e configurar políticas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolios') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);
    END IF;
END $$;

-- Remover políticas antigas se existirem para evitar conflitos ao recriar
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolios' AND auth.role() = 'authenticated');
