-- ============================================================
-- 010_notices_institute_scope_for_reps.sql
-- Run AFTER 009.
--
-- Relaxes the notices rule: a rep/captain/vice_captain can now tag
-- their notice with ANY combination of scopes (activity + hostel +
-- institute), as long as the notice is tied to their own activity --
-- e.g. their club running an inter-hostel or institute-level event.
--
-- Still admin-only: a notice with NO activity attached at all (a pure
-- general/institute announcement unrelated to any specific club/sport),
-- since there's no ownership to check in that case.
-- ============================================================

drop policy if exists "notices_insert_rep" on notices;

create policy "notices_insert_rep"
  on notices for insert
  with check (
    activity_id is not null
    and owns_activity(activity_id)
    and 'activity_specific' = any(scopes)
    -- hostel_specific and institute_wide are both now allowed alongside
    -- activity_specific, no extra restriction needed here.
  );
-- "notices_admin_write" (for all) still covers admin posting anything,
-- including notices with no activity_id at all.
