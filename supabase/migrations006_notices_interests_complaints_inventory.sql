-- ============================================================
-- 006_notices_interests_complaints_inventory.sql
-- Run this AFTER 005_fix_reference_table_rls.sql
--
-- 1. Notices: single `scope` -> multi-value `scopes` array, so one
--    notice can be tagged institute + hostel + activity at once.
-- 2. New `notice_interests` table: "interested" / "not interested"
--    toggle per student per notice, visible so reps/admins can see
--    engagement.
-- 3. Complaints: fixed so the RAISER can no longer read their own
--    complaint back -- only admin can, per your spec. raised_by is
--    still stored so admin can identify fake complaints.
-- 4. Inventory: adds an explicit status label + board_id to the
--    current-status view, so BRCA/BSA can be filtered cleanly and
--    "available" vs "checked out" doesn't have to be inferred.
-- ============================================================

-- ---------- 1. Notices: scope -> scopes[] ----------
alter table notices add column if not exists scopes text[] not null default '{}';

-- migrate any existing single-scope data into the new array column
update notices set scopes = array[scope] where scopes = '{}' and scope is not null;

alter table notices drop constraint if exists notices_scope_check;
alter table notices drop column if exists scope;

alter table notices drop constraint if exists notices_scopes_check;
alter table notices add constraint notices_scopes_check
  check (scopes <@ array['institute_wide','hostel_specific','activity_specific']
         and array_length(scopes, 1) > 0);

create index if not exists idx_notices_scopes on notices using gin (scopes);

-- Replace the insert policy: reps/captains/vice_captains can tag their
-- notice activity_specific (+ optionally hostel_specific for their own
-- hostel), but can NEVER include institute_wide -- that stays admin-only.
drop policy if exists "notices_insert_own_activity" on notices;

create policy "notices_insert_rep"
  on notices for insert
  with check (
    not ('institute_wide' = any(scopes))
    and 'activity_specific' = any(scopes)
    and owns_activity(activity_id)
    and (
      not ('hostel_specific' = any(scopes))
      or hostel_id = (select hostel_id from profiles where id = auth.uid())
    )
  );
-- "notices_admin_write" (for all) already exists from policies.sql and
-- still covers admin posting anything, including institute_wide.

-- ---------- 2. Notice interests ("I'm interested") ----------
create table if not exists notice_interests (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (notice_id, user_id)
);

alter table notice_interests enable row level security;

-- Anyone can see who's interested in what -- this is a lightweight,
-- non-sensitive RSVP-style signal (like a public interest count),
-- so reps/captains/admins can gauge engagement, and any student can
-- see the running count too.
create policy "notice_interests_select_all"
  on notice_interests for select
  using (auth.role() = 'authenticated');

-- A student can mark/unmark their OWN interest only.
create policy "notice_interests_insert_self"
  on notice_interests for insert
  with check (auth.uid() = user_id);

create policy "notice_interests_delete_self"
  on notice_interests for delete
  using (auth.uid() = user_id);

-- Handy view: interest count per notice, so the frontend doesn't have
-- to count rows client-side.
create or replace view notice_interest_counts
with (security_invoker = true) as
select notice_id, count(*) as interested_count
from notice_interests
group by notice_id;

-- ---------- 3. Complaints: admin-only visibility ----------
drop policy if exists "complaints_select_own_or_admin" on complaints;

create policy "complaints_select_admin_only"
  on complaints for select
  using (is_admin());
-- Insert policy (complaints_insert_self) is unchanged -- anyone can
-- still FILE a complaint as themselves, they just can't read it back
-- afterward. raised_by is still recorded for admin to see who filed it.

-- ---------- 4. Inventory: explicit status + board filtering ----------
drop view if exists inventory_current_status;

create view inventory_current_status
with (security_invoker = true) as
select
  i.id as item_id,
  i.item_name,
  i.activity_id,
  a.board_id,
  a.name as activity_name,
  i.hostel_id,
  i.quantity,
  i.condition,
  case when c.borrower_name is not null then 'checked_out' else 'available' end as status,
  c.borrower_name,
  c.borrower_entry_number,
  c.borrower_phone,
  c.issued_at,
  c.expected_return_at
from inventory_items i
join activities a on a.id = i.activity_id
left join lateral (
  select * from inventory_checkouts
  where item_id = i.id and returned_at is null
  order by issued_at desc
  limit 1
) c on true;
