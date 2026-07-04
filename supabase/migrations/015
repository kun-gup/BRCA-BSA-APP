-- ============================================================
-- 015_events_link_reminders_directory.sql
-- Run AFTER 014.
--
-- 1. notices.event_id -- optional link from a notice to a real
--    calendar event (so posting a match announcement can also put
--    it on the calendar, instead of two disconnected things).
--    Enforced: if set, the event must belong to the SAME activity
--    as the notice.
-- 2. event_reminders -- personal "mark as important / remind me"
--    per user per event. Purely personal, no engagement-count needed.
-- 3. reps_directory view -- "Know Your Reps/Captains/VCs" page data,
--    one row per person per activity they represent.
-- ============================================================

-- ---------- 1. Link notices to events ----------
alter table notices add column if not exists event_id uuid references events(id) on delete set null;

create or replace function check_notice_event_activity_match()
returns trigger as $$
begin
  if new.event_id is not null then
    if not exists (
      select 1 from events where id = new.event_id and activity_id = new.activity_id
    ) then
      raise exception 'Linked event must belong to the same activity as the notice.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_notice_event_activity on notices;
create trigger trg_check_notice_event_activity
  before insert or update on notices
  for each row execute function check_notice_event_activity_match();

-- ---------- 2. Event reminders / "mark as important" ----------
create table if not exists event_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table event_reminders enable row level security;
drop policy if exists "event_reminders_own" on event_reminders;
create policy "event_reminders_own" on event_reminders for all using (auth.uid() = user_id);
-- Purely personal -- no one else needs to read another person's
-- reminders, unlike notice_interests which is meant to show engagement.

-- ---------- 3. Know Your Reps / Captains / VCs directory ----------
create or replace view reps_directory
with (security_invoker = true) as
select
  a.board_id,
  b.name as board_name,
  a.id as activity_id,
  a.name as activity_name,
  p.id as user_id,
  p.name as rep_name,
  p.entry_number,
  p.role,
  h.short_code as hostel_short_code
from user_activities ua
join profiles p on p.id = ua.user_id
join activities a on a.id = ua.activity_id
join boards b on b.id = a.board_id
join hostels h on h.id = ua.hostel_id
order by b.name, a.name, p.role;
-- Readable by anyone authenticated (relies on existing select policies
-- on profiles/user_activities/activities/boards/hostels -- all already
-- open to any authenticated user, so no new policy needed here).
