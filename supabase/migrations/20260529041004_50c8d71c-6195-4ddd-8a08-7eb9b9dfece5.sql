-- Adicionar coluna ward na tabela professionals
ALTER TABLE public.professionals ADD COLUMN ward TEXT;

-- Criar um índice para performance na busca por ala
CREATE INDEX idx_professionals_ward ON public.professionals(ward);
