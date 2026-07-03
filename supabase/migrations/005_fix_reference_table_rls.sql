-- ============================================================
-- 005_fix_reference_table_rls.sql
-- Fixes: RLS got manually enabled on hostels/boards/activities via the
-- Supabase dashboard UI, but no policies were ever written for them --
-- which means RLS silently blocks EVERYONE (including logged-in users),
-- while the SQL Editor (which runs as postgres, bypassing RLS) looked
-- fine the whole time. This is why queries "succeeded" but returned 0 rows.
--
-- These 3 tables are static reference data (hostel/club/sport names) --
-- not sensitive, so read access is open to anyone, even logged-out
-- visitors (anon). Writes stay admin-only.
-- ============================================================

drop policy if exists "hostels_select_all" on hostels;
create policy "hostels_select_all" on hostels for select using (true);
create policy "hostels_admin_write" on hostels for all using (is_admin());

drop policy if exists "boards_select_all" on boards;
create policy "boards_select_all" on boards for select using (true);
create policy "boards_admin_write" on boards for all using (is_admin());

drop policy if exists "activities_select_all" on activities;
create policy "activities_select_all" on activities for select using (true);
create policy "activities_admin_write" on activities for all using (is_admin());
