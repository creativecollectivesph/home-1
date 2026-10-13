-- Job Collectives V11: run on the existing tjc-portal project AFTER reviewing and backing up data.
-- Add Supabase Auth accounts via the dashboard, then assign profiles explicitly.
-- Every sensitive table has RLS; anon users can SELECT only published jobs.
create extension if not exists pgcrypto;
create table if not exists public.jc_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  status text not null default 'onboarding' check (status in ('lead','onboarding','active','paused','completed')),
  timezone text not null default 'America/New_York',
  service_package text not null default 'Foundation',
  created_at timestamptz not null default now()
);
create table if not exists public.jc_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('management','talent','client','hr')),
  full_name text not null,
  email text not null default '',
  job_title text not null default '',
  client_id uuid references public.jc_clients(id) on delete set null,
  timezone text not null default 'Asia/Manila',
  created_at timestamptz not null default now()
);
create or replace function public.jc_has_role(roles text[])
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.jc_profiles p where p.id=auth.uid() and p.role=any(roles)) $$;
create or replace function public.jc_my_client_id()
returns uuid language sql stable security definer set search_path=public
as $$ select p.client_id from public.jc_profiles p where p.id=auth.uid() limit 1 $$;
create table if not exists public.jc_tasks (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 2 and 220),
 detail text not null default '',
 client_id uuid not null references public.jc_clients(id) on delete cascade,
 assignee_id uuid references public.jc_profiles(id) on delete set null,
 status text not null default 'todo' check(status in ('todo','progress','review','done','blocked')),
 priority text not null default 'normal' check(priority in ('normal','high','urgent')),
 due_date date,
 created_by uuid references public.jc_profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.jc_shifts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.jc_profiles(id) on delete cascade,
 clock_in timestamptz not null default now(),
 clock_out timestamptz,
 created_at timestamptz not null default now(),
 check(clock_out is null or clock_out >= clock_in)
);
create unique index if not exists shifts_one_open_per_user on public.jc_shifts(user_id) where clock_out is null;
create index if not exists shifts_user_clock on public.jc_shifts(user_id,clock_in desc);
create table if not exists public.jc_presence (
 user_id uuid primary key references public.jc_profiles(id) on delete cascade,
 status text not null default 'active' check(status in ('active','away','busy','break')),
 updated_at timestamptz not null default now()
);
create table if not exists public.jc_time_entries (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.jc_profiles(id),
 task_id uuid not null references public.jc_tasks(id),
 minutes integer not null check(minutes between 1 and 1440),
 note text not null default '',
 work_date date not null default current_date,
 created_at timestamptz not null default now()
);
create table if not exists public.jc_accomplishments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.jc_profiles(id),
 client_id uuid not null references public.jc_clients(id),
 summary text not null check(char_length(summary) between 5 and 5000),
 work_date date not null default current_date,
 created_at timestamptz not null default now()
);
create table if not exists public.jc_job_openings (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 3 and 180),
 summary text not null default '',
 employment_type text not null default 'Full time',
 schedule text not null default 'Remote',
 location text not null default 'Philippines (Remote)',
 status text not null default 'draft' check(status in ('draft','published','closed')),
 created_by uuid references public.jc_profiles(id),
 published_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.jc_support_tickets (
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null references public.jc_profiles(id),
 client_id uuid references public.jc_clients(id),
 title text not null check(char_length(title) between 3 and 200),
 description text not null default '',
 category text not null default 'general' check(category in ('general','technical','client','hr','payroll')),
 status text not null default 'open' check(status in ('open','in_progress','resolved')),
 created_at timestamptz not null default now()
);
create table if not exists public.jc_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.jc_profiles(id),
 recipient_id uuid not null references public.jc_profiles(id),
 body text not null check(char_length(body) between 1 and 4000),
 created_at timestamptz not null default now(),
 read_at timestamptz
);
create table if not exists public.jc_leave_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.jc_profiles(id),
 start_date date not null,
 end_date date not null,
 reason text not null default '',
 status text not null default 'pending' check(status in ('pending','approved','declined')),
 created_at timestamptz not null default now(),
 check(end_date >= start_date)
);
create or replace function public.jc_can_message(other uuid)
returns boolean language sql stable security definer set search_path=public as $$
select exists (
 select 1 from public.jc_profiles target, public.jc_profiles me
 where me.id=auth.uid() and target.id=other and other <> auth.uid()
 and (me.role in ('management','hr')
 or target.role='management'
 or (me.role='talent' and target.role='client' and exists(select 1 from public.jc_tasks t where t.assignee_id=me.id and t.client_id=target.client_id))
 or (me.role='client' and target.role='talent' and exists(select 1 from public.jc_tasks t where t.assignee_id=target.id and t.client_id=me.client_id)))
) $$;
-- RLS always on.
alter table public.jc_clients enable row level security;
alter table public.jc_profiles enable row level security;
alter table public.jc_tasks enable row level security;
alter table public.jc_shifts enable row level security;
alter table public.jc_presence enable row level security;
alter table public.jc_time_entries enable row level security;
alter table public.jc_accomplishments enable row level security;
alter table public.jc_job_openings enable row level security;
alter table public.jc_support_tickets enable row level security;
alter table public.jc_messages enable row level security;
alter table public.jc_leave_requests enable row level security;
create policy "clients_read" on public.jc_clients for select to authenticated using (
 public.jc_has_role(array['management','hr']) or id=public.jc_my_client_id() or exists(select 1 from public.jc_tasks t where t.client_id=jc_clients.id and t.assignee_id=auth.uid())
);
create policy "clients_manage" on public.jc_clients for all to authenticated using(public.jc_has_role(array['management'])) with check(public.jc_has_role(array['management']));
create policy "profiles_read" on public.jc_profiles for select to authenticated using(
 id=auth.uid() or public.jc_has_role(array['management','hr']) or role='management' or (role='talent' and exists(select 1 from public.jc_tasks t where t.assignee_id=jc_profiles.id and t.client_id=public.jc_my_client_id()))
);
create policy "profiles_manage" on public.jc_profiles for all to authenticated using(public.jc_has_role(array['management'])) with check(public.jc_has_role(array['management']));
create policy "tasks_read" on public.jc_tasks for select to authenticated using(public.jc_has_role(array['management','hr']) or assignee_id=auth.uid() or client_id=public.jc_my_client_id());
create policy "tasks_management_write" on public.jc_tasks for all to authenticated using(public.jc_has_role(array['management'])) with check(public.jc_has_role(array['management']));
create policy "shifts_read" on public.jc_shifts for select to authenticated using(user_id=auth.uid() or public.jc_has_role(array['management','hr']));
create policy "presence_read" on public.jc_presence for select to authenticated using(user_id=auth.uid() or public.jc_has_role(array['management','hr']));
create policy "presence_insert" on public.jc_presence for insert to authenticated with check(user_id=auth.uid());
create policy "presence_update" on public.jc_presence for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "time_entries_read" on public.jc_time_entries for select to authenticated using(user_id=auth.uid() or public.jc_has_role(array['management','hr']) or exists(select 1 from public.jc_tasks t where t.id=jc_time_entries.task_id and t.client_id=public.jc_my_client_id()));
create policy "time_entries_insert" on public.jc_time_entries for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.jc_tasks t where t.id=task_id and t.assignee_id=auth.uid()));
create policy "accomplishments_read" on public.jc_accomplishments for select to authenticated using(user_id=auth.uid() or public.jc_has_role(array['management','hr']) or client_id=public.jc_my_client_id());
create policy "accomplishments_insert" on public.jc_accomplishments for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.jc_tasks t where t.client_id=jc_accomplishments.client_id and t.assignee_id=auth.uid()));
create policy "jobs_public_read" on public.jc_job_openings for select to anon,authenticated using(status='published' or public.jc_has_role(array['management','hr']));
create policy "jobs_staff_write" on public.jc_job_openings for all to authenticated using(public.jc_has_role(array['management','hr'])) with check(public.jc_has_role(array['management','hr']));
create policy "support_read" on public.jc_support_tickets for select to authenticated using(created_by=auth.uid() or public.jc_has_role(array['management']) or (public.jc_has_role(array['hr']) and category in ('hr','payroll')));
create policy "support_insert" on public.jc_support_tickets for insert to authenticated with check(created_by=auth.uid() and (client_id is null or client_id=public.jc_my_client_id() or exists(select 1 from public.jc_tasks t where t.client_id=jc_support_tickets.client_id and t.assignee_id=auth.uid())));
create policy "support_staff_update" on public.jc_support_tickets for update to authenticated using(public.jc_has_role(array['management']) or (public.jc_has_role(array['hr']) and category in ('hr','payroll'))) with check(public.jc_has_role(array['management']) or (public.jc_has_role(array['hr']) and category in ('hr','payroll')));
create policy "messages_read" on public.jc_messages for select to authenticated using(sender_id=auth.uid() or recipient_id=auth.uid());
create policy "messages_insert" on public.jc_messages for insert to authenticated with check(sender_id=auth.uid() and public.jc_can_message(recipient_id));
create policy "messages_mark_read" on public.jc_messages for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
create policy "leave_read" on public.jc_leave_requests for select to authenticated using(user_id=auth.uid() or public.jc_has_role(array['management','hr']));
create policy "leave_insert" on public.jc_leave_requests for insert to authenticated with check(user_id=auth.uid() and public.jc_has_role(array['talent']));
create policy "leave_update" on public.jc_leave_requests for update to authenticated using(public.jc_has_role(array['management','hr'])) with check(public.jc_has_role(array['management','hr']));
-- Database-controlled punch timestamps (no user-editable clock_in/out field).
create or replace function public.jc_clock_in()
returns public.jc_shifts language plpgsql security definer set search_path=public as $$
declare v public.jc_shifts;
begin
 if auth.uid() is null or not public.jc_has_role(array['talent']) then raise exception 'Talent account required'; end if;
 insert into public.jc_shifts(user_id,clock_in) values(auth.uid(),now()) returning * into v;
 return v;
exception when unique_violation then raise exception 'You already have an open shift';
end;$$;
create or replace function public.jc_clock_out()
returns public.jc_shifts language plpgsql security definer set search_path=public as $$
declare v public.jc_shifts;
begin
 if auth.uid() is null or not public.jc_has_role(array['talent']) then raise exception 'Talent account required'; end if;
 update public.jc_shifts set clock_out=now() where user_id=auth.uid() and clock_out is null returning * into v;
 if v.id is null then raise exception 'No open shift'; end if;
 return v;
end;$$;
-- Restrict credential-free RPC to authenticated identities.
revoke all on function public.jc_clock_in() from public,anon;
revoke all on function public.jc_clock_out() from public,anon;
grant execute on function public.jc_clock_in() to authenticated;
grant execute on function public.jc_clock_out() to authenticated;
-- Status updates must NOT allow talent/client to modify assignment or pricing.
create or replace function public.jc_set_task_status(p_task uuid,p_status text)
returns public.jc_tasks language plpgsql security definer set search_path=public as $$
declare v public.jc_tasks;
begin
 if p_status not in ('progress','review','blocked','done','todo') then raise exception 'Invalid status'; end if;
 select * into v from public.jc_tasks where id=p_task;
 if v.id is null then raise exception 'Task not found'; end if;
 if not public.jc_has_role(array['management']) and not (
   (v.assignee_id=auth.uid() and p_status in ('progress','review','blocked')) or
   (v.client_id=public.jc_my_client_id() and v.status='review' and p_status='done')
 ) then raise exception 'Not authorized to change this task'; end if;
 update public.jc_tasks set status=p_status,updated_at=now() where id=p_task returning * into v;
 return v;
end;$$;
revoke all on function public.jc_set_task_status(uuid,text) from public,anon;
grant execute on function public.jc_set_task_status(uuid,text) to authenticated;
-- Do not let message recipients change body/sender or a published job's author via side-channel.
create or replace function public.jc_enforce_message_read_only()
returns trigger language plpgsql set search_path=public as $$
begin
 if row(new.sender_id,new.recipient_id,new.body,new.created_at) is distinct from row(old.sender_id,old.recipient_id,old.body,old.created_at) then
   raise exception 'Only read status may be updated';
 end if;
 return new;
end;$$;
drop trigger if exists messages_read_only on public.jc_messages;
create trigger messages_read_only before update on public.jc_messages for each row execute function public.jc_enforce_message_read_only();
-- UI reads/writes via anon / authenticated keys with RLS; NEVER expose service_role keys.
-- Explicit client grants: RLS still filters every authenticated operation.
grant usage on schema public to anon,authenticated;
revoke all on table public.jc_clients,public.jc_profiles,public.jc_tasks,public.jc_shifts,public.jc_presence,public.jc_time_entries,public.jc_accomplishments,public.jc_support_tickets,public.jc_messages,public.jc_leave_requests from anon;
grant select on public.jc_job_openings to anon;
grant select,insert,update,delete on table public.jc_clients,public.jc_profiles,public.jc_tasks,public.jc_shifts,public.jc_presence,public.jc_time_entries,public.jc_accomplishments,public.jc_job_openings,public.jc_support_tickets,public.jc_messages,public.jc_leave_requests to authenticated;
-- Do not let management accidentally assign tasks to client/HR identities.
create or replace function public.jc_require_talent_assignee()
returns trigger language plpgsql set search_path=public as $$
begin
 if new.assignee_id is not null and not exists(select 1 from public.jc_profiles p where p.id=new.assignee_id and p.role='talent') then
   raise exception 'Task assignee must be a talent account';
 end if;
 return new;
end;$$;
drop trigger if exists tasks_talent_only on public.jc_tasks;
create trigger tasks_talent_only before insert or update of assignee_id on public.jc_tasks for each row execute function public.jc_require_talent_assignee();

create index if not exists jc_tasks_assignee_status on public.jc_tasks(assignee_id,status);
create index if not exists jc_tasks_client_due on public.jc_tasks(client_id,due_date);
create index if not exists jc_time_entries_user_date on public.jc_time_entries(user_id,work_date desc);
create index if not exists jc_messages_to_created on public.jc_messages(recipient_id,created_at desc);
create index if not exists jc_job_openings_published on public.jc_job_openings(published_at desc) where status='published';
