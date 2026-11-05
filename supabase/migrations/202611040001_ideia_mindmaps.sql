create table if not exists public.ideia_mindmaps (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'Meu Plano I.D.E.ia',
 answers jsonb not null default '{}'::jsonb,
 mindmap jsonb not null default '[]'::jsonb,
 is_free boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists ideia_mindmaps_one_free_per_user on public.ideia_mindmaps(user_id) where is_free;
alter table public.ideia_mindmaps enable row level security;
grant select,insert,update,delete on public.ideia_mindmaps to authenticated;
create or replace function public.can_access_ideia_workspace()
returns boolean language sql stable security definer set search_path=public as $$
 select auth.uid() is not null and (
  lower(coalesce(auth.jwt()->>'email',''))='suporteapp9@gmail.com'
  or exists(select 1 from public.inscricoes_sala_secreta i
    where lower(i.email)=lower(coalesce(auth.jwt()->>'email',''))
    and i.status in ('confirmada','convite_enviado'))
 );
$$;
revoke all on function public.can_access_ideia_workspace() from public;
grant execute on function public.can_access_ideia_workspace() to authenticated;
drop policy if exists ideia_maps_select_owner_or_admin on public.ideia_mindmaps;
create policy ideia_maps_select_owner_or_admin on public.ideia_mindmaps for select to authenticated
using(user_id=(select auth.uid()) or lower(coalesce(auth.jwt()->>'email',''))='suporteapp9@gmail.com');
drop policy if exists ideia_maps_insert_owner on public.ideia_mindmaps;
create policy ideia_maps_insert_owner on public.ideia_mindmaps for insert to authenticated
with check(user_id=(select auth.uid()) and is_free=true and public.can_access_ideia_workspace());
drop policy if exists ideia_maps_update_owner_or_admin on public.ideia_mindmaps;
create policy ideia_maps_update_owner_or_admin on public.ideia_mindmaps for update to authenticated
using(user_id=(select auth.uid()) or lower(coalesce(auth.jwt()->>'email',''))='suporteapp9@gmail.com')
with check(user_id=(select auth.uid()) or lower(coalesce(auth.jwt()->>'email',''))='suporteapp9@gmail.com');
drop policy if exists ideia_maps_delete_owner_or_admin on public.ideia_mindmaps;
create policy ideia_maps_delete_owner_or_admin on public.ideia_mindmaps for delete to authenticated
using(user_id=(select auth.uid()) or lower(coalesce(auth.jwt()->>'email',''))='suporteapp9@gmail.com');
