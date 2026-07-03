-- ============================================================
-- 008_remaining_features.sql
-- Adds: star performers, memories gallery, push notification tokens,
-- notification mute preferences, admin activity log (with automatic
-- triggers), and 2 analytics views.
-- Run AFTER 007.
-- ============================================================

-- ---------- Star Performer of the Month ----------
create table star_performers (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  activity_id uuid references activities(id),
  user_id uuid not null references profiles(id),
  month integer not null check (month between 1 and 12),
  year integer not null,
  achievement text not null,
  photo_url text,
  nominated_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table star_performers enable row level security;
create policy "star_performers_select_all" on star_performers for select using (auth.role() = 'authenticated');
create policy "star_performers_admin_write" on star_performers for all using (is_admin());

-- ---------- Memories / Achievements Gallery ----------
create table memories (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  activity_id uuid references activities(id),
  title text not null,
  description text,
  category text not null default 'milestone'
    check (category in ('competition_win','performance','milestone','throwback')),
  drive_link text,
  cover_photo_url text,
  season text,
  posted_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table memories enable row level security;
create policy "memories_select_all" on memories for select using (auth.role() = 'authenticated');

-- Reps/captains/vice_captains can post for their own activity; can also
-- edit/delete their own posts. Admin can moderate (edit/delete) anything.
create policy "memories_insert_own_activity" on memories for insert
  with check (activity_id is null or owns_activity(activity_id));
create policy "memories_update_own_or_admin" on memories for update
  using (is_admin() or auth.uid() = posted_by);
create policy "memories_delete_own_or_admin" on memories for delete
  using (is_admin() or auth.uid() = posted_by);

-- ---------- Push Notification Tokens ----------
create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  platform text check (platform in ('ios','android')),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table push_tokens enable row level security;
create policy "push_tokens_own" on push_tokens for all using (auth.uid() = user_id);
create policy "push_tokens_admin_read" on push_tokens for select using (is_admin());

-- ---------- Notification Mute Preferences ----------
create table user_activity_mutes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, activity_id)
);

alter table user_activity_mutes enable row level security;
create policy "mutes_own" on user_activity_mutes for all using (auth.uid() = user_id);

-- ---------- Admin Activity Log (automatic, via triggers) ----------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,        -- INSERT / UPDATE / DELETE
  table_name text not null,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;
create policy "activity_log_admin_only" on activity_log for select using (is_admin());
-- No insert/update/delete policy for regular users -- only the trigger
-- function (running as security definer / table owner) writes here.

create or replace function log_activity()
returns trigger as $$
begin
  insert into activity_log (actor_id, action, table_name, record_id, old_value, new_value)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end), null),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_scores on scores;
create trigger trg_log_scores after insert or update or delete on scores
  for each row execute function log_activity();

drop trigger if exists trg_log_deductions on deductions;
create trigger trg_log_deductions after insert or update or delete on deductions
  for each row execute function log_activity();

drop trigger if exists trg_log_notices on notices;
create trigger trg_log_notices after insert or update or delete on notices
  for each row execute function log_activity();

drop trigger if exists trg_log_profiles_role on profiles;
create trigger trg_log_profiles_role after update of role on profiles
  for each row execute function log_activity();

-- ---------- Analytics views (for the admin dashboard) ----------

-- Events with low registration turnout (participation health)
create or replace view analytics_low_participation
with (security_invoker = true) as
select
  e.id as event_id, e.title, e.activity_id, a.name as activity_name,
  e.max_participants,
  count(r.id) as registered_count,
  case when e.max_participants > 0
    then round(100.0 * count(r.id) / e.max_participants, 1)
    else null end as fill_percent
from events e
join activities a on a.id = e.activity_id
left join registrations r on r.event_id = e.id
where e.status in ('upcoming','ongoing') and e.max_participants is not null
group by e.id, e.title, e.activity_id, a.name, e.max_participants
having e.max_participants > 0
   and count(r.id) < (e.max_participants * 0.5);

-- Inventory items flagged as poor condition or missing
create or replace view analytics_inventory_flags
with (security_invoker = true) as
select * from inventory_current_status
where condition in ('poor','missing');
