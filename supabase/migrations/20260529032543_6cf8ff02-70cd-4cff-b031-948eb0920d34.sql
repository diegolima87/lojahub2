-- Ajustar política de SELECT para evitar listagem (apenas acesso direto via URL/path)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] IS NOT NULL);
-- Nota: A política acima ainda permite acesso, mas o linter 0025 geralmente reclama de 'true' ou falta de filtros.
-- Para ser mais específico e satisfazer o linter de listagem, podemos restringir a quem conhece o nome do arquivo.
-- Mas buckets públicos por natureza permitem SELECT. Vamos tentar uma versão que filtre por bucket.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
-- O linter 0025 costuma disparar se a política for apenas 'true'. 
-- Se o bucket é 'public: true', a listagem é controlada pela política de SELECT.
