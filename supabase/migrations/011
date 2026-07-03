-- ============================================================
-- 011_fix_notices_scopes_migration.sql
-- Fixes: 006 tried to drop the old `scope` column while a policy still
-- referenced it, which failed and rolled back the whole change. This
-- redoes it in the correct order: drop the old policy FIRST, then the
-- column. Safe to run even if some of this partially exists.
-- ============================================================

-- 1. Drop the OLD policy that still references `scope` (singular),
--    if it's still hanging around.
drop policy if exists "notices_insert_own_activity" on notices;

-- 2. Add the new scopes[] column and migrate any existing data into it.
alter table notices add column if not exists scopes text[] not null default '{}';

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'notices' and column_name = 'scope') then
    update notices set scopes = array[scope] where scopes = '{}' and scope is not null;
  end if;
end $$;

-- 3. Now it's safe to drop the old column and its constraint.
alter table notices drop constraint if exists notices_scope_check;
alter table notices drop column if exists scope;

-- 4. Constraint + index on the new column.
alter table notices drop constraint if exists notices_scopes_check;
alter table notices add constraint notices_scopes_check
  check (scopes <@ array['institute_wide','hostel_specific','activity_specific']
         and array_length(scopes, 1) > 0);

create index if not exists idx_notices_scopes on notices using gin (scopes);

-- 5. Recreate the final (most permissive, from migration 010) insert
--    policy for reps -- any scope combination, as long as tied to
--    their own activity.
drop policy if exists "notices_insert_rep" on notices;
create policy "notices_insert_rep"
  on notices for insert
  with check (
    activity_id is not null
    and owns_activity(activity_id)
    and 'activity_specific' = any(scopes)
  );

-- ---------- Verify ----------
select column_name from information_schema.columns where table_name = 'notices';
-- ^ should now show "scopes" and NOT show "scope"
