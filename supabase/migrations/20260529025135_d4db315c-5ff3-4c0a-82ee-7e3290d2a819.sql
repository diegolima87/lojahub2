
-- =========================
-- ENUMS
-- =========================
create type public.app_role as enum ('admin', 'professional', 'customer');
create type public.service_status as enum ('draft', 'pending', 'active', 'rejected', 'archived');
create type public.quote_status as enum ('pending', 'responded', 'accepted', 'declined', 'closed');
create type public.subscription_status as enum ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
create type public.subscription_plan as enum ('free', 'premium');

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  city text,
  state text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- =========================
-- USER ROLES (separate table; never on profiles)
-- =========================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles"
  on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins view all roles"
  on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- AUTO PROFILE ON SIGNUP
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- UPDATED_AT helper
-- =========================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================
-- CATEGORIES
-- =========================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Categories public read"
  on public.categories for select using (active = true);
create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- PROFESSIONALS
-- =========================
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  professional_title text not null,
  company_name text,
  description text,
  years_experience int default 0,
  website text,
  instagram text,
  linkedin text,
  cover_url text,
  verified boolean not null default false,
  premium boolean not null default false,
  rating numeric(3,2) not null default 0,
  total_reviews int not null default 0,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index professionals_slug_idx on public.professionals(slug);
create index professionals_user_idx on public.professionals(user_id);

grant select on public.professionals to anon, authenticated;
grant insert, update on public.professionals to authenticated;
grant all on public.professionals to service_role;
alter table public.professionals enable row level security;

create policy "Professionals public read"
  on public.professionals for select using (true);
create policy "Users create own professional"
  on public.professionals for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own professional"
  on public.professionals for update to authenticated using (auth.uid() = user_id);
create policy "Admins manage professionals"
  on public.professionals for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger professionals_set_updated_at before update on public.professionals
  for each row execute function public.set_updated_at();

-- =========================
-- SERVICES
-- =========================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null,
  starting_price numeric(12,2),
  online_service boolean not null default false,
  presential_service boolean not null default true,
  city text,
  state text,
  status public.service_status not null default 'active',
  slug text not null,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, slug)
);

create index services_pro_idx on public.services(professional_id);
create index services_category_idx on public.services(category_id);
create index services_status_idx on public.services(status);

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;

create policy "Services public read active"
  on public.services for select using (status = 'active' or exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ) or public.has_role(auth.uid(), 'admin'));
create policy "Pros insert own services"
  on public.services for insert to authenticated with check (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));
create policy "Pros update own services"
  on public.services for update to authenticated using (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));
create policy "Pros delete own services"
  on public.services for delete to authenticated using (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));

create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- =========================
-- PORTFOLIOS
-- =========================
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  created_at timestamptz not null default now()
);

grant select on public.portfolios to anon, authenticated;
grant insert, update, delete on public.portfolios to authenticated;
grant all on public.portfolios to service_role;
alter table public.portfolios enable row level security;

create policy "Portfolios public read"
  on public.portfolios for select using (true);
create policy "Pros manage own portfolio"
  on public.portfolios for all to authenticated using (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));

-- =========================
-- QUOTE REQUESTS
-- =========================
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  message text not null,
  budget numeric(12,2),
  status public.quote_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index qr_customer_idx on public.quote_requests(customer_id);
create index qr_pro_idx on public.quote_requests(professional_id);

grant select, insert, update on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;

create policy "Customer reads own quotes"
  on public.quote_requests for select to authenticated using (customer_id = auth.uid());
create policy "Pro reads received quotes"
  on public.quote_requests for select to authenticated using (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));
create policy "Customer creates quote"
  on public.quote_requests for insert to authenticated with check (customer_id = auth.uid());
create policy "Pro updates received quote"
  on public.quote_requests for update to authenticated using (exists (
    select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
  ));

-- =========================
-- CONVERSATIONS & MESSAGES
-- =========================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid unique references public.quote_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index conv_customer_idx on public.conversations(customer_id);
create index conv_pro_idx on public.conversations(professional_id);

grant select, insert, update on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;

create policy "Participants read conversation"
  on public.conversations for select to authenticated using (
    customer_id = auth.uid() or exists (
      select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
    )
  );
create policy "Customers create conversation"
  on public.conversations for insert to authenticated with check (customer_id = auth.uid());
create policy "Participants update conversation"
  on public.conversations for update to authenticated using (
    customer_id = auth.uid() or exists (
      select 1 from public.professionals p where p.id = professional_id and p.user_id = auth.uid()
    )
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index msg_conv_idx on public.messages(conversation_id);

grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;

create policy "Participants read messages"
  on public.messages for select to authenticated using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.customer_id = auth.uid() or exists (
        select 1 from public.professionals p where p.id = c.professional_id and p.user_id = auth.uid()
      ))
  ));
create policy "Participants send messages"
  on public.messages for insert to authenticated with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or exists (
          select 1 from public.professionals p where p.id = c.professional_id and p.user_id = auth.uid()
        ))
    )
  );
create policy "Participants update messages"
  on public.messages for update to authenticated using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.customer_id = auth.uid() or exists (
        select 1 from public.professionals p where p.id = c.professional_id and p.user_id = auth.uid()
      ))
  ));

-- update conversation last_message_at on new message
create or replace function public.bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end; $$;
create trigger messages_bump_conv after insert on public.messages
  for each row execute function public.bump_conversation();

-- =========================
-- REVIEWS
-- =========================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (customer_id, professional_id)
);

create index reviews_pro_idx on public.reviews(professional_id);

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create policy "Reviews public read"
  on public.reviews for select using (true);
create policy "Customers write reviews"
  on public.reviews for insert to authenticated with check (customer_id = auth.uid());
create policy "Customers update own reviews"
  on public.reviews for update to authenticated using (customer_id = auth.uid());
create policy "Customers delete own reviews"
  on public.reviews for delete to authenticated using (customer_id = auth.uid());

-- recompute rating
create or replace function public.recompute_professional_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare _pro uuid;
begin
  _pro := coalesce(new.professional_id, old.professional_id);
  update public.professionals p set
    rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where professional_id = _pro), 0),
    total_reviews = (select count(*) from public.reviews where professional_id = _pro)
  where p.id = _pro;
  return null;
end; $$;
create trigger reviews_recompute_rating after insert or update or delete on public.reviews
  for each row execute function public.recompute_professional_rating();

-- =========================
-- FAVORITES
-- =========================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, professional_id)
);

grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;

create policy "Customers read own favorites"
  on public.favorites for select to authenticated using (customer_id = auth.uid());
create policy "Customers manage own favorites"
  on public.favorites for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- =========================
-- SUBSCRIPTIONS
-- =========================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status public.subscription_status not null default 'incomplete',
  plan public.subscription_plan not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy "Admins read all subscriptions"
  on public.subscriptions for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger subs_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- =========================
-- REALTIME
-- =========================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- =========================
-- SEED CATEGORIES
-- =========================
insert into public.categories (name, slug, icon, sort_order) values
  ('Architects', 'architects', 'Compass', 10),
  ('Lawyers', 'lawyers', 'Scale', 20),
  ('Accountants', 'accountants', 'Calculator', 30),
  ('Photographers', 'photographers', 'Camera', 40),
  ('Web Developers', 'web-developers', 'Code', 50),
  ('Designers', 'designers', 'Palette', 60),
  ('Marketing', 'marketing', 'Megaphone', 70),
  ('Tutors', 'tutors', 'GraduationCap', 80),
  ('Therapists', 'therapists', 'HeartPulse', 90),
  ('Real Estate', 'real-estate', 'Home', 100),
  ('Financial Advisors', 'financial-advisors', 'TrendingUp', 110),
  ('Contractors', 'contractors', 'Hammer', 120),
  ('Cleaners', 'cleaners', 'Sparkles', 130),
  ('Personal Trainers', 'personal-trainers', 'Dumbbell', 140),
  ('Event Planners', 'event-planners', 'CalendarHeart', 150),
  ('Videographers', 'videographers', 'Video', 160);
