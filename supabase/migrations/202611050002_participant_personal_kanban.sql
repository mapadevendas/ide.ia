-- Kanban pessoal dos participantes da Sala Secreta I.D.E.ia
create table if not exists public.ideia_participant_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '',
  status text not null default 'para_fazer'
    check (status in ('para_fazer','em_andamento','feito')),
  priority text not null default 'media'
    check (priority in ('baixa','media','alta')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideia_participant_tasks_user_status_idx
  on public.ideia_participant_tasks(user_id,status,created_at desc);

alter table public.ideia_participant_tasks enable row level security;

revoke all on table public.ideia_participant_tasks from anon, authenticated;
grant select,insert,update,delete on public.ideia_participant_tasks to authenticated;

drop policy if exists ideia_participant_tasks_select_owner on public.ideia_participant_tasks;
create policy ideia_participant_tasks_select_owner
on public.ideia_participant_tasks for select to authenticated
using (user_id = (select auth.uid()) and public.can_access_ideia_workspace());

drop policy if exists ideia_participant_tasks_insert_owner on public.ideia_participant_tasks;
create policy ideia_participant_tasks_insert_owner
on public.ideia_participant_tasks for insert to authenticated
with check (user_id = (select auth.uid()) and public.can_access_ideia_workspace());

drop policy if exists ideia_participant_tasks_update_owner on public.ideia_participant_tasks;
create policy ideia_participant_tasks_update_owner
on public.ideia_participant_tasks for update to authenticated
using (user_id = (select auth.uid()) and public.can_access_ideia_workspace())
with check (user_id = (select auth.uid()) and public.can_access_ideia_workspace());

drop policy if exists ideia_participant_tasks_delete_owner on public.ideia_participant_tasks;
create policy ideia_participant_tasks_delete_owner
on public.ideia_participant_tasks for delete to authenticated
using (user_id = (select auth.uid()) and public.can_access_ideia_workspace());
