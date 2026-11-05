-- Não conceder DELETE sem RLS ativo na tabela de inscrições.
do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'inscricoes_sala_secreta'
      and c.relrowsecurity = true
  ) then
    raise exception 'RLS precisa estar habilitado em public.inscricoes_sala_secreta antes de conceder DELETE.';
  end if;
end
$$;

-- Quadro Kanban administrativo das necessidades do treinamento I.D.E.ia
-- Acesso restrito ao e-mail administrativo do projeto.

grant delete on table public.inscricoes_sala_secreta to authenticated;

drop policy if exists inscricoes_admin_delete on public.inscricoes_sala_secreta;
create policy inscricoes_admin_delete
on public.inscricoes_sala_secreta
for delete
to authenticated
using (lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com');

create table if not exists public.ideia_training_tasks (
  id uuid primary key default gen_random_uuid(),
  need_key text not null unique,
  title text not null,
  summary text not null default '',
  action text not null default '',
  tool text not null default '',
  prompt text not null default '',
  task_status text not null default 'para_fazer'
    check (task_status in ('para_fazer', 'em_andamento', 'feito')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideia_training_tasks enable row level security;

grant select, insert, update on public.ideia_training_tasks to authenticated;

drop policy if exists ideia_training_tasks_admin_select on public.ideia_training_tasks;
create policy ideia_training_tasks_admin_select
on public.ideia_training_tasks
for select
to authenticated
using (lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com');

drop policy if exists ideia_training_tasks_admin_insert on public.ideia_training_tasks;
create policy ideia_training_tasks_admin_insert
on public.ideia_training_tasks
for insert
to authenticated
with check (lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com');

drop policy if exists ideia_training_tasks_admin_update on public.ideia_training_tasks;
create policy ideia_training_tasks_admin_update
on public.ideia_training_tasks
for update
to authenticated
using (lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com');
