-- ============================================================
-- 004_captain_role_and_leaderboards.sql
-- Run this AFTER policies.sql (needs is_admin() / owns_activity()).
--
-- This file is safe to re-run (idempotent) -- every statement either
-- checks "if exists" first or uses "create or replace" / "drop ... if
-- exists" before creating, so running it twice won't error out.
--
-- What this adds on top of 001-003 + policies.sql:
-- 1. 'captain' role (BSA sports now have captain + vice_captain, equal
--    permissions -- both are just rows in user_activities for that sport)
-- 2. Direct score editing: reps/captains/vice_captains can insert, update,
--    AND delete scores for their own activity, live -- no more pending/
--    admin-verify gate. Admin can do this for any activity. We keep
--    submitted_by + a new updated_by column so every change is still
--    traceable to a person, even without an approval step.
-- 3. Students can now cancel their own event registration (gap fix --
--    previously they could register but never un-register).
-- 4. Two leaderboard views: per-activity and overall-per-board.
-- ============================================================

-- ---------- 1. Add 'captain' role ----------
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('student', 'rep', 'vice_captain', 'captain', 'admin'));

-- ---------- 2. Direct score editing ----------
alter table scores add column if not exists updated_by uuid references profiles(id);
alter table scores add column if not exists updated_at timestamptz not null default now();
-- status / verified_by / appeal_deadline columns are left in place, unused
-- for now, in case you ever want an approval flow back -- nothing below
-- depends on them.

drop policy if exists "scores_insert_own_activity" on scores;
drop policy if exists "scores_admin_update" on scores;
drop policy if exists "scores_write_own_activity" on scores;
drop policy if exists "scores_update_own_activity" on scores;
drop policy if exists "scores_delete_own_activity" on scores;
drop policy if exists "scores_admin_all" on scores;

create policy "scores_write_own_activity"
  on scores for insert
  with check (
    exists (
      select 1 from events
      where events.id = scores.event_id
      and owns_activity(events.activity_id)
    )
  );

create policy "scores_update_own_activity"
  on scores for update
  using (
    exists (
      select 1 from events
      where events.id = scores.event_id
      and owns_activity(events.activity_id)
    )
  );

create policy "scores_delete_own_activity"
  on scores for delete
  using (
    exists (
      select 1 from events
      where events.id = scores.event_id
      and owns_activity(events.activity_id)
    )
  );

create policy "scores_admin_all"
  on scores for all
  using (is_admin());

-- ---------- 3. Registration self-cancel (gap fix) ----------
drop policy if exists "registrations_delete_self" on registrations;
create policy "registrations_delete_self"
  on registrations for delete
  using (auth.uid() = user_id);

-- ---------- 4. Leaderboard views ----------
drop view if exists leaderboard_overall;
drop view if exists leaderboard_by_activity;

create view leaderboard_by_activity
with (security_invoker = true) as
select
  a.board_id,
  a.id as activity_id,
  a.name as activity_name,
  h.id as hostel_id,
  h.name as hostel_name,
  h.short_code,
  coalesce(sum(s.points_awarded), 0)
    - coalesce((
        select sum(d.points_deducted) from deductions d
        where d.activity_id = a.id and d.hostel_id = h.id and d.status = 'confirmed'
      ), 0) as total_points
from activities a
cross join hostels h
left join events e on e.activity_id = a.id
left join scores s on s.event_id = e.id and s.hostel_id = h.id
group by a.board_id, a.id, a.name, h.id, h.name, h.short_code;

create view leaderboard_overall
with (security_invoker = true) as
select
  board_id,
  hostel_id,
  hostel_name,
  short_code,
  sum(total_points) as total_points
from leaderboard_by_activity
group by board_id, hostel_id, hostel_name, short_code;
