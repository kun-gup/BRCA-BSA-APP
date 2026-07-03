-- ============================================================
-- 012_repair_rolled_back_changes.sql
-- Repairs everything that silently rolled back when 006 failed
-- partway through (notice_interests table, complaints policy,
-- inventory_current_status view). Also re-confirms the star
-- performer rep-nomination policies from 009 in case that
-- transaction was also affected.
--
-- Every statement guards against "already exists" so this is safe
-- to run no matter what partially succeeded before.
-- ============================================================

-- ---------- notice_interests ----------
create table if not exists notice_interests (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (notice_id, user_id)
);

alter table notice_interests enable row level security;

drop policy if exists "notice_interests_select_all" on notice_interests;
create policy "notice_interests_select_all" on notice_interests for select using (auth.role() = 'authenticated');

drop policy if exists "notice_interests_insert_self" on notice_interests;
create policy "notice_interests_insert_self" on notice_interests for insert with check (auth.uid() = user_id);

drop policy if exists "notice_interests_delete_self" on notice_interests;
create policy "notice_interests_delete_self" on notice_interests for delete using (auth.uid() = user_id);

create or replace view notice_interest_counts
with (security_invoker = true) as
select notice_id, count(*) as interested_count
from notice_interests
group by notice_id;

-- ---------- complaints (final desired state: raiser + admin can read) ----------
drop policy if exists "complaints_select_own_or_admin" on complaints;
drop policy if exists "complaints_select_admin_only" on complaints;
create policy "complaints_select_own_or_admin"
  on complaints for select
  using (auth.uid() = raised_by or is_admin());

-- ---------- inventory_current_status (with board_id + status) ----------
-- analytics_inventory_flags depends on this view, so drop it first.
drop view if exists analytics_inventory_flags;
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

-- Recreate the dependent view now that inventory_current_status exists again.
create view analytics_inventory_flags
with (security_invoker = true) as
select * from inventory_current_status
where condition in ('poor','missing');

-- ---------- star_performers rep-nomination rights (from 009, re-confirmed) ----------
drop policy if exists "star_performers_admin_write" on star_performers;
drop policy if exists "star_performers_insert_own_activity" on star_performers;
create policy "star_performers_insert_own_activity"
  on star_performers for insert
  with check (is_admin() or (activity_id is not null and owns_activity(activity_id)));

drop policy if exists "star_performers_update_own_or_admin" on star_performers;
create policy "star_performers_update_own_or_admin"
  on star_performers for update
  using (is_admin() or auth.uid() = nominated_by);

drop policy if exists "star_performers_delete_own_or_admin" on star_performers;
create policy "star_performers_delete_own_or_admin"
  on star_performers for delete
  using (is_admin() or auth.uid() = nominated_by);

-- ---------- Verify ----------
select 'notice_interests' as check_name, count(*) from notice_interests
union all
select 'inventory_current_status has board_id', count(*) from information_schema.columns
  where table_name = 'inventory_current_status' and column_name = 'board_id'
union all
select 'complaints policies', count(*) from pg_policy p
  join pg_class t on t.oid = p.polrelid where t.relname = 'complaints';
