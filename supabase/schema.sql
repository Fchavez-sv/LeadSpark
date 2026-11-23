-- LeadSpark - Esquema inicial para Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard > SQL Editor (o como migración)
-- Crea: tablas leads, lead_notes, profiles + triggers + RLS

begin;

-- ---------------------------------------------------------------------------
-- 1) Funciones auxiliares
-- ---------------------------------------------------------------------------

-- Actualiza automáticamente updated_at en modificaciones
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Crea/actualiza perfil cuando se registra un usuario en Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Tablas
-- ---------------------------------------------------------------------------

-- Perfiles del equipo interno (vinculados a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Trigger en auth.users para aprovisionar perfiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Leads captados desde la landing pública
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  source text not null,
  privacy_consent boolean not null,
  consented_at timestamptz,
  status text not null default 'nuevo'
    check (status in ('nuevo', 'contactado', 'calificado', 'descartado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_privacy_consent_required check (privacy_consent = true)
);

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Notas de seguimiento por lead (CRM interno)
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  note text not null check (char_length(trim(note)) > 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3) Índices
-- ---------------------------------------------------------------------------

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists lead_notes_lead_id_idx on public.lead_notes (lead_id);
create index if not exists lead_notes_created_at_idx on public.lead_notes (created_at desc);

-- ---------------------------------------------------------------------------
-- 4) Row Level Security (RLS)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

-- PROFILES: usuarios autenticados pueden ver perfiles del equipo y editar el propio
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- LEADS: anónimos SOLO pueden insertar; autenticados pueden leer y actualizar
drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon"
on public.leads
for insert
to anon
with check (
  privacy_consent = true
  and status = 'nuevo'
);

drop policy if exists "leads_select_authenticated" on public.leads;
create policy "leads_select_authenticated"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "leads_update_authenticated" on public.leads;
create policy "leads_update_authenticated"
on public.leads
for update
to authenticated
using (true)
with check (true);

-- (Opcional) permitir también a usuarios autenticados insertar leads manualmente
-- desde el dashboard si se requiere en el futuro:
-- drop policy if exists "leads_insert_authenticated" on public.leads;
-- create policy "leads_insert_authenticated"
-- on public.leads for insert to authenticated
-- with check (privacy_consent = true);

-- LEAD_NOTES: solo equipo autenticado puede leer y agregar notas
drop policy if exists "lead_notes_select_authenticated" on public.lead_notes;
create policy "lead_notes_select_authenticated"
on public.lead_notes
for select
to authenticated
using (true);

drop policy if exists "lead_notes_insert_authenticated" on public.lead_notes;
create policy "lead_notes_insert_authenticated"
on public.lead_notes
for insert
to authenticated
with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- 5) Permisos de esquema (complemento a RLS)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon;
grant select, update on table public.leads to authenticated;
grant select, insert on table public.lead_notes to authenticated;
grant select, update on table public.profiles to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Notas operativas
-- ---------------------------------------------------------------------------
-- 1. Si ya existen usuarios en Auth antes de crear el trigger, inserta sus
--    perfiles manualmente:
--    insert into public.profiles (id, email, full_name)
--    select id, email, coalesce(raw_user_meta_data->>'full_name','')
--    from auth.users
--    on conflict (id) do nothing;
--
-- 2. El formulario público debe enviar: full_name, email, phone, company,
--    source, privacy_consent=true y (recomendado) consented_at=now(), status='nuevo'.
-- 3. No expongas la service_role key en el frontend; usa solo la anon key con RLS.
-- 4. Si en el futuro el equipo autenticado debe crear leads desde el dashboard,
--    descomenta la política "leads_insert_authenticated".
