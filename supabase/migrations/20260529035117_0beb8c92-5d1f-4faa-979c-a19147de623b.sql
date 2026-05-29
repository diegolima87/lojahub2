-- Adicionar coluna category_id na tabela professionals
ALTER TABLE public.professionals ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Inserir novas categorias
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
('Nutricionistas', 'nutricionistas', 'Apple', 170),
('Psicólogos', 'psicologos', 'Brain', 180),
('Dentistas', 'dentistas', 'Stethoscope', 190),
('Eletricistas', 'eletricistas', 'Zap', 200),
('Encanadores', 'encanadores', 'Droplets', 210),
('Mecânicos', 'mecanicos', 'Wrench', 220),
('Esteticistas', 'esteticistas', 'Sparkles', 230),
('Tradutores', 'tradutores', 'Languages', 240),
('Veterinários', 'veterinarios', 'Dog', 250),
('Manicure / Pedicure', 'manicure-pedicure', 'Hand', 260);

-- Criar um índice para performance
CREATE INDEX idx_professionals_category_id ON public.professionals(category_id);

-- Tentar migrar dados existentes (opcional, mas bom se houver dados)
-- UPDATE public.professionals p 
-- SET category_id = (SELECT s.category_id FROM public.services s WHERE s.professional_id = p.id LIMIT 1)
-- WHERE category_id IS NULL;
