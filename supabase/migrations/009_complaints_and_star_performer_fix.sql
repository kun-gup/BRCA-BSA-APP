-- ============================================================
-- 009_complaints_and_star_performer_fix.sql
-- Run AFTER 008.
--
-- 1. Complaints: raiser can now read back complaints THEY filed
--    (in addition to admin). Still hidden from the accused and
--    everyone else.
-- 2. Star performers: reps/captains/vice_captains can now nominate
--    for THEIR OWN activity, not just admin. They can also edit/
--    delete their own nomination. Admin retains full control over any.
-- ============================================================

-- ---------- 1. Complaints ----------
drop policy if exists "complaints_select_admin_only" on complaints;

create policy "complaints_select_own_or_admin"
  on complaints for select
  using (auth.uid() = raised_by or is_admin());
-- against_user_id still has no select access -- the accused cannot
-- see complaints about them, which is the actual anonymity guarantee.

-- ---------- 2. Star Performers ----------
drop policy if exists "star_performers_admin_write" on star_performers;

create policy "star_performers_insert_own_activity"
  on star_performers for insert
  with check (
    is_admin()
    or (activity_id is not null and owns_activity(activity_id))
  );

create policy "star_performers_update_own_or_admin"
  on star_performers for update
  using (is_admin() or auth.uid() = nominated_by);

create policy "star_performers_delete_own_or_admin"
  on star_performers for delete
  using (is_admin() or auth.uid() = nominated_by);
