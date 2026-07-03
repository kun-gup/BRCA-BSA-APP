-- ============================================================
-- schema.sql
-- CONSOLIDATED final-state schema for the Satpura GC App.
--
-- Use this file for any NEW Supabase project instead of replaying
-- migrations 001-014 (which include several patch/fix files from
-- live debugging -- functionally correct, but messy history).
--
-- Run in this order on a fresh project:
--   1. schema.sql       (this file)
--   2. policies.sql      (RLS rules, consolidated)
--   3. seed.sql          (hostels/boards/activities)
--
-- The migrations/ folder is kept for historical record only.
-- ============================================================

-- ---------- Reference data ----------
create table hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text not null unique
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  name text not null,
  full_name text,
  is_competitive boolean not null default true,
  logo_url text
);

-- ---------- Users ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  entry_number text not null unique,
  name text not null,
  role text not null default 'student'
    check (role in ('student', 'rep', 'vice_captain', 'captain', 'admin')),
  hostel_id uuid references hostels(id),
  created_at timestamptz not null default now()
);

create table user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  hostel_id uuid not null references hostels(id),
  unique (user_id, activity_id)
);

-- ---------- Events & Registrations ----------
create table events (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  title text not null,
  type text not null default 'competitive'
    check (type in ('competitive', 'non_competitive', 'institute_workshop')),
  audience text not null default 'all'
    check (audience in ('all', 'freshers_only')),
  start_date date not null,
  end_date date not null,
  time time,
  venue text,
  points integer default 0,
  rulebook_url text,
  registration_type text not null default 'notify_only'
    check (registration_type in ('external_link', 'notify_only')),
  registration_link text,
  max_participants integer,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  season text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  hostel_id uuid not null references hostels(id),
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------- Scores & Deductions ----------
create table scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  hostel_id uuid not null references hostels(id),
  points_awarded numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'contested')),
  submitted_by uuid references profiles(id),
  verified_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  appeal_deadline timestamptz,
  created_at timestamptz not null default now()
);

create table deductions (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id),
  activity_id uuid not null references activities(id),
  reason text not null,
  points_deducted numeric not null default 0,
  flagged_by uuid references profiles(id),
  confirmed_by uuid references profiles(id),
  status text not null default 'flagged'
    check (status in ('flagged', 'confirmed', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------- Notices ----------
create table notices (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  posted_by uuid references profiles(id),
  scopes text[] not null default '{}',
  hostel_id uuid references hostels(id),
  activity_id uuid references activities(id),
  title text not null,
  body text not null,
  category text not null default 'info'
    check (category in ('info', 'registration', 'result', 'alert', 'rule_change')),
  pinned boolean not null default false,
  event_date date,
  event_time time,
  rulebook_url text,
  created_at timestamptz not null default now(),
  constraint notices_scopes_check check (
    scopes <@ array['institute_wide','hostel_specific','activity_specific']
    and array_length(scopes, 1) > 0
  )
);

create table notice_interests (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (notice_id, user_id)
);

-- ---------- Inventory ----------
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  hostel_id uuid not null references hostels(id),
  item_name text not null,
  quantity integer not null default 0,
  condition text not null default 'good'
    check (condition in ('good', 'fair', 'poor', 'missing')),
  last_updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

create table inventory_checkouts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  issued_by uuid not null references profiles(id),
  quantity integer not null default 1 check (quantity > 0),
  borrower_name text not null,
  borrower_entry_number text not null,
  borrower_phone text not null,
  issued_at timestamptz not null default now(),
  expected_return_at date,
  returned_at timestamptz,
  returned_condition text
    check (returned_condition in ('good', 'fair', 'poor', 'damaged', 'lost')),
  notes text
);

-- ---------- Complaints ----------
create table complaints (
  id uuid primary key default gen_random_uuid(),
  raised_by uuid references profiles(id),
  against_user_id uuid references profiles(id),
  activity_id uuid references activities(id),
  category text not null
    check (category in ('rep_performance', 'management_issue', 'general_query')),
  description text not null,
  status text not null default 'open'
    check (status in ('open', 'in_review', 'resolved')),
  created_at timestamptz not null default now()
);

-- ---------- Star Performers & Memories ----------
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

-- ---------- Notifications & Preferences ----------
create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  platform text check (platform in ('ios','android')),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create table user_activity_mutes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, activity_id)
);

-- ---------- Admin Activity Log ----------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index idx_scores_hostel on scores(hostel_id);
create index idx_scores_event on scores(event_id);
create index idx_events_activity on events(activity_id);
create index idx_events_dates on events(start_date, end_date);
create index idx_user_activities_user on user_activities(user_id);
create index idx_registrations_event on registrations(event_id);
create index idx_notices_board on notices(board_id);
create index idx_notices_activity on notices(activity_id);
create index idx_notices_scopes on notices using gin (scopes);
create index idx_inventory_activity on inventory_items(activity_id);
create index idx_checkouts_item on inventory_checkouts(item_id);
create index idx_checkouts_open on inventory_checkouts(item_id) where returned_at is null;

-- ---------- Views ----------
create view leaderboard_by_activity
with (security_invoker = true) as
select
  a.board_id, a.id as activity_id, a.name as activity_name,
  h.id as hostel_id, h.name as hostel_name, h.short_code,
  coalesce(sum(s.points_awarded), 0)
    - coalesce((select sum(d.points_deducted) from deductions d
        where d.activity_id = a.id and d.hostel_id = h.id and d.status = 'confirmed'), 0) as total_points
from activities a
cross join hostels h
left join events e on e.activity_id = a.id
left join scores s on s.event_id = e.id and s.hostel_id = h.id
group by a.board_id, a.id, a.name, h.id, h.name, h.short_code;

create view leaderboard_overall
with (security_invoker = true) as
select board_id, hostel_id, hostel_name, short_code, sum(total_points) as total_points
from leaderboard_by_activity
group by board_id, hostel_id, hostel_name, short_code;

create view inventory_current_status
with (security_invoker = true) as
select
  i.id as item_id, i.item_name, i.activity_id, a.board_id, a.name as activity_name,
  i.hostel_id, i.quantity as total_quantity,
  coalesce(active.checked_out_qty, 0) as checked_out_quantity,
  i.quantity - coalesce(active.checked_out_qty, 0) as available_quantity,
  case
    when coalesce(active.checked_out_qty, 0) = 0 then 'available'
    when coalesce(active.checked_out_qty, 0) < i.quantity then 'partially_checked_out'
    else 'fully_checked_out'
  end as status,
  i.condition,
  last_co.borrower_name as last_borrower_name,
  last_co.borrower_entry_number as last_borrower_entry_number,
  last_co.borrower_phone as last_borrower_phone,
  last_co.issued_at as last_issued_at,
  last_co.returned_at as last_returned_at
from inventory_items i
join activities a on a.id = i.activity_id
left join lateral (
  select sum(quantity) as checked_out_qty from inventory_checkouts
  where item_id = i.id and returned_at is null
) active on true
left join lateral (
  select * from inventory_checkouts where item_id = i.id order by issued_at desc limit 1
) last_co on true;

create view inventory_active_checkouts
with (security_invoker = true) as
select
  c.id as checkout_id, c.item_id, i.item_name, i.activity_id, a.board_id,
  c.quantity, c.borrower_name, c.borrower_entry_number, c.borrower_phone,
  c.issued_at, c.expected_return_at
from inventory_checkouts c
join inventory_items i on i.id = c.item_id
join activities a on a.id = i.activity_id
where c.returned_at is null;

create view notice_interest_counts
with (security_invoker = true) as
select notice_id, count(*) as interested_count
from notice_interests
group by notice_id;

create view analytics_low_participation
with (security_invoker = true) as
select
  e.id as event_id, e.title, e.activity_id, a.name as activity_name,
  e.max_participants, count(r.id) as registered_count,
  case when e.max_participants > 0 then round(100.0 * count(r.id) / e.max_participants, 1) else null end as fill_percent
from events e
join activities a on a.id = e.activity_id
left join registrations r on r.event_id = e.id
where e.status in ('upcoming','ongoing') and e.max_participants is not null
group by e.id, e.title, e.activity_id, a.name, e.max_participants
having e.max_participants > 0 and count(r.id) < (e.max_participants * 0.5);

create view analytics_inventory_flags
with (security_invoker = true) as
select * from inventory_current_status where condition in ('poor','missing');

-- ---------- Auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta jsonb;
  resolved_hostel_id uuid;
begin
  meta := new.raw_user_meta_data;
  if meta ? 'hostel_short_code' then
    select id into resolved_hostel_id from hostels where short_code = meta->>'hostel_short_code';
  end if;
  insert into public.profiles (id, entry_number, name, role, hostel_id)
  values (
    new.id, split_part(new.email, '@', 1),
    coalesce(meta->>'name', split_part(new.email, '@', 1)),
    'student', resolved_hostel_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Activity log triggers ----------
create or replace function log_activity()
returns trigger as $$
begin
  insert into activity_log (actor_id, action, table_name, record_id, old_value, new_value)
  values (
    auth.uid(), tg_op, tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end), null),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_log_scores after insert or update or delete on scores for each row execute function log_activity();
create trigger trg_log_deductions after insert or update or delete on deductions for each row execute function log_activity();
create trigger trg_log_notices after insert or update or delete on notices for each row execute function log_activity();
create trigger trg_log_profiles_role after update of role on profiles for each row execute function log_activity();

-- ---------- Inventory checkout quantity enforcement ----------
create or replace function enforce_checkout_quantity()
returns trigger as $$
declare
  total_qty integer;
  already_out integer;
begin
  select quantity into total_qty from inventory_items where id = new.item_id;
  select coalesce(sum(quantity), 0) into already_out from inventory_checkouts
    where item_id = new.item_id and returned_at is null;
  if already_out + new.quantity > total_qty then
    raise exception 'Not enough units available: % of % already checked out, % requested',
      already_out, total_qty, new.quantity;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_enforce_checkout_quantity
  before insert on inventory_checkouts
  for each row execute function enforce_checkout_quantity();

-- ---------- Storage bucket for rulebooks ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rulebooks', 'rulebooks', true, 10485760,
  array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
