
-- Add search_path to set_updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke EXECUTE from public/anon/authenticated on trigger functions (only DB needs them)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.bump_conversation() from public, anon, authenticated;
revoke execute on function public.recompute_professional_rating() from public, anon, authenticated;

-- has_role is used in RLS — keep available to authenticated only
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
