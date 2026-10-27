-- Cena Pronta — schema do Supabase (estado atual consolidado)
-- Rode no SQL Editor de um projeto novo. Depois crie o primeiro convite de admin manualmente:
--   insert into public.invite_codes(code, label, grants_admin, max_uses, expires_at)
--   values ('ADM-' || upper(encode(extensions.gen_random_bytes(6),'hex')), 'admin', true, 1, now() + interval '1 day')
--   returning code;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- ───────── Tabelas
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  approved boolean not null default false,
  access_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.invite_codes (
  code text primary key check (char_length(code) between 8 and 64),
  label text check (char_length(label) <= 80),
  grants_admin boolean not null default false,
  max_uses int not null default 1 check (max_uses between 1 and 10000),
  uses int not null default 0,
  expires_at timestamptz,
  access_days int check (access_days is null or access_days between 1 and 3650),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index invite_codes_created_by_idx on public.invite_codes(created_by);

create table public.usage_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index usage_log_user_created_idx on public.usage_log(user_id, created_at desc);

create table public.scene_previews (
  scene_id text primary key check (scene_id ~ '^[a-z0-9-]{2,60}$'),
  path text not null check (char_length(path) < 200),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index scene_previews_updated_by_idx on public.scene_previews(updated_by);

alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.usage_log enable row level security;
alter table public.scene_previews enable row level security;

revoke all on public.usage_log from anon, authenticated;
revoke all on public.invite_codes from anon;
revoke insert, update, delete on public.invite_codes from authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke all on public.scene_previews from anon;

-- ───────── Helpers
create or replace function private.is_approved() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select approved and (access_until is null or access_until > now())
                   from public.profiles where id = (select auth.uid())), false);
$$;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'admin' and approved from public.profiles where id = (select auth.uid())), false);
$$;
grant execute on function private.is_approved() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- ───────── Policies
create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "admin read profiles" on public.profiles for select to authenticated using ((select private.is_admin()));
create policy "admin read invites" on public.invite_codes for select to authenticated using ((select private.is_admin()));
create policy "members read previews" on public.scene_previews for select to authenticated using ((select private.is_approved()));
create policy "admin insert previews" on public.scene_previews for insert to authenticated with check ((select private.is_admin()));
create policy "admin update previews" on public.scene_previews for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin delete previews" on public.scene_previews for delete to authenticated using ((select private.is_admin()));

-- ───────── Cadastro só com convite (valida e consome o código antes de criar o usuário)
create or replace function private.gate_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(trim(coalesce(new.raw_user_meta_data->>'invite_code','')));
  v_admin boolean; v_days int;
begin
  update public.invite_codes set uses = uses + 1
   where code = v_code and uses < max_uses and (expires_at is null or expires_at > now())
  returning grants_admin, access_days into v_admin, v_days;
  if not found then raise exception 'INVITE_INVALID' using errcode = 'P0001'; end if;
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data,'{}'::jsonb) - 'invite_code';
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data,'{}'::jsonb)
     || jsonb_build_object('approved', true, 'role', case when v_admin then 'admin' else 'user' end, 'access_days', v_days);
  return new;
end $$;

create or replace function private.create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_days int := nullif(new.raw_app_meta_data->>'access_days','')::int;
begin
  insert into public.profiles(id, email, role, approved, access_until)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'role','user'),
          coalesce((new.raw_app_meta_data->>'approved')::boolean, false),
          case when v_days is not null then now() + make_interval(days => v_days) end);
  return new;
end $$;
revoke execute on function private.gate_signup() from public, anon, authenticated;
revoke execute on function private.create_profile() from public, anon, authenticated;

create trigger gate_signup before insert on auth.users for each row execute function private.gate_signup();
create trigger create_profile after insert on auth.users for each row execute function private.create_profile();

-- ───────── RPCs
create or replace function public.consume_quota() returns int
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid()); v_count int; v_limit constant int := 80;
begin
  if v_uid is null or not private.is_approved() then return -1; end if;
  perform pg_advisory_xact_lock(hashtext(v_uid::text));
  select count(*) into v_count from public.usage_log where user_id = v_uid and created_at > now() - interval '24 hours';
  if v_count >= v_limit then return -1; end if;
  insert into public.usage_log(user_id) values (v_uid);
  return v_limit - v_count - 1;
end $$;

create or replace function public.create_invite(p_label text, p_max_uses int, p_valid_days int, p_access_days int)
returns text language plpgsql security definer set search_path = '' as $$
declare v_hex text; v_code text;
begin
  if not private.is_admin() then raise exception 'FORBIDDEN'; end if;
  v_hex := upper(encode(extensions.gen_random_bytes(6),'hex'));
  v_code := 'CP-' || substr(v_hex,1,4) || '-' || substr(v_hex,5,4) || '-' || substr(v_hex,9,4);
  insert into public.invite_codes(code,label,max_uses,expires_at,access_days,created_by)
  values (v_code, left(p_label,80), least(greatest(coalesce(p_max_uses,1),1),1000),
          case when coalesce(p_valid_days,0) > 0 then now() + make_interval(days => least(p_valid_days,365)) end,
          case when coalesce(p_access_days,0) > 0 then least(p_access_days,3650) end,
          (select auth.uid()));
  return v_code;
end $$;

create or replace function public.set_user_access(p_user uuid, p_approved boolean, p_extend_days int)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_user = (select auth.uid()) then raise exception 'SELF'; end if;
  update public.profiles
     set approved = p_approved,
         access_until = case when coalesce(p_extend_days,0) > 0
           then greatest(coalesce(access_until, now()), now()) + make_interval(days => least(p_extend_days,3650))
           else access_until end
   where id = p_user and role <> 'admin';
end $$;

create or replace function public.revoke_invite(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'FORBIDDEN'; end if;
  update public.invite_codes set expires_at = now() where code = p_code;
end $$;

revoke execute on function public.consume_quota() from public, anon;
revoke execute on function public.create_invite(text,int,int,int) from public, anon;
revoke execute on function public.set_user_access(uuid,boolean,int) from public, anon;
revoke execute on function public.revoke_invite(text) from public, anon;
grant execute on function public.consume_quota() to authenticated;
grant execute on function public.create_invite(text,int,int,int) to authenticated;
grant execute on function public.set_user_access(uuid,boolean,int) to authenticated;
grant execute on function public.revoke_invite(text) to authenticated;

-- ───────── Storage das prévias (privado)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('previews', 'previews', false, 26214400, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

create policy "members read preview files" on storage.objects for select to authenticated
  using (bucket_id = 'previews' and (select private.is_approved()));
create policy "admin upload preview files" on storage.objects for insert to authenticated
  with check (bucket_id = 'previews' and (select private.is_admin()));
create policy "admin update preview files" on storage.objects for update to authenticated
  using (bucket_id = 'previews' and (select private.is_admin()));
create policy "admin delete preview files" on storage.objects for delete to authenticated
  using (bucket_id = 'previews' and (select private.is_admin()));
