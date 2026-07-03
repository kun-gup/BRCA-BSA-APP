-- ============================================================
-- create-three-test-accounts.sql
-- Turns 3 already-signed-up auth accounts into student/rep/admin
-- test profiles. Safe to re-run (uses ON CONFLICT DO NOTHING).
--
-- BEFORE running this: go to the test dashboard's Connection page
-- and Sign Up all 3 emails below (any password, 6+ chars each).
-- ============================================================

-- ---------- STUDENT ----------
insert into profiles (id, entry_number, name, role, hostel_id)
select
  (select id from auth.users where email = 'student1@satpura.iitd.ac.in'),
  '2025ST0001', 'Test Student', 'student',
  (select id from hostels where short_code = 'SAT')
on conflict (id) do update set role = 'student';

-- ---------- REP (Cricket) ----------
insert into profiles (id, entry_number, name, role, hostel_id)
select
  (select id from auth.users where email = 'rep1@satpura.iitd.ac.in'),
  '2025RP0001', 'Test Rep', 'rep',
  (select id from hostels where short_code = 'SAT')
on conflict (id) do update set role = 'rep';

insert into user_activities (user_id, activity_id, hostel_id)
select
  (select id from auth.users where email = 'rep1@satpura.iitd.ac.in'),
  (select id from activities where name = 'Cricket'),
  (select id from hostels where short_code = 'SAT')
on conflict (user_id, activity_id) do nothing;

-- ---------- ADMIN ----------
insert into profiles (id, entry_number, name, role, hostel_id)
select
  (select id from auth.users where email = 'admin1@satpura.iitd.ac.in'),
  '2025AD0001', 'Test Admin', 'admin',
  (select id from hostels where short_code = 'SAT')
on conflict (id) do update set role = 'admin';

-- ---------- Verify ----------
select p.name, p.role, h.short_code, p.entry_number
from profiles p
left join hostels h on h.id = p.hostel_id
where p.entry_number in ('2025ST0001','2025RP0001','2025AD0001')
order by p.role;
-- ^ You should see exactly 3 rows: student, rep, admin.
-- If a row is missing, that email wasn't signed up yet (do that first).
