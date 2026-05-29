ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_customer_id_professional_id_key;
ALTER TABLE public.reviews ALTER COLUMN customer_id DROP NOT NULL;