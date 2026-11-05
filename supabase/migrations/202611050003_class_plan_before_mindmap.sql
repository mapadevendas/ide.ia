-- Plano da aula definido pela tutora. O mapa mental só existe depois que as ações forem definidas.
create table if not exists public.ideia_class_plans (
  id integer primary key default 1 check (id = 1),
  title text not null default 'Aula I.D.E.ia',
  summary text not null default '',
  objective text not null default '',
  identify_actions jsonb not null default '[]'::jsonb,
  direct_actions jsonb not null default '[]'::jsonb,
  expand_actions jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  mindmap jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.ideia_class_plans enable row level security;
grant select, insert, update on public.ideia_class_plans to authenticated;

drop policy if exists ideia_class_plans_admin_select on public.ideia_class_plans;
create policy ideia_class_plans_admin_select
on public.ideia_class_plans for select to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) = 'suporteapp9@gmail.com'
  or (is_published = true and public.can_access_ideia_workspace()));

drop policy if exists ideia_class_plans_admin_insert on public.ideia_class_plans;
create policy ideia_class_plans_admin_insert
on public.ideia_class_plans for insert to authenticated
with check (lower(coalesce(auth.jwt()->>'email','')) = 'suporteapp9@gmail.com');

drop policy if exists ideia_class_plans_admin_update on public.ideia_class_plans;
create policy ideia_class_plans_admin_update
on public.ideia_class_plans for update to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) = 'suporteapp9@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email','')) = 'suporteapp9@gmail.com');
