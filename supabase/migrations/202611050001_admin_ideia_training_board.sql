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


-- Lista administrativa de mapas, com vínculo pelo e-mail autenticado.
-- A função só retorna dados quando chamada pelo e-mail administrativo.
create or replace function public.get_ideia_admin_maps()
returns table (
  id uuid,
  user_id uuid,
  title text,
  answers jsonb,
  mindmap jsonb,
  updated_at timestamptz,
  participant_name text,
  participant_email text,
  participant_whatsapp text,
  registration_status text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    m.id,
    m.user_id,
    m.title,
    m.answers,
    m.mindmap,
    m.updated_at,
    coalesce(nullif(i.nome, ''), split_part(u.email, '@', 1)) as participant_name,
    u.email as participant_email,
    i.whatsapp as participant_whatsapp,
    i.status as registration_status
  from public.ideia_mindmaps m
  join auth.users u on u.id = m.user_id
  left join lateral (
    select reg.nome, reg.whatsapp, reg.status
    from public.inscricoes_sala_secreta reg
    where lower(reg.email) = lower(u.email)
    order by reg.created_at desc
    limit 1
  ) i on true
  where lower(coalesce(auth.jwt()->>'email', '')) = 'suporteapp9@gmail.com'
  order by m.updated_at desc;
$$;

revoke all on function public.get_ideia_admin_maps() from public;
grant execute on function public.get_ideia_admin_maps() to authenticated;
