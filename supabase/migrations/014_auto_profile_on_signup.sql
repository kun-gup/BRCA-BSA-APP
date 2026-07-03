-- ============================================================
-- 014_auto_profile_on_signup.sql
-- Run AFTER 013.
--
-- Solves: "how do we feed data for 500 students?" -- answer: we don't,
-- manually. Students self-register through the signup screen, and this
-- trigger automatically creates their `profiles` row the instant their
-- auth account is created. No admin data entry needed for students at all.
--
-- Reps/captains/vice_captains/admins are a small number (~30-40 people)
-- -- those get promoted by an admin AFTER they've self-signed-up, via
-- a simple role update (see FRONTEND_INTEGRATION_GUIDE.md).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta jsonb;
  resolved_hostel_id uuid;
begin
  meta := new.raw_user_meta_data;

  -- Look up hostel by short_code if the frontend passed one at signup
  -- (e.g. supabase.auth.signUp({ email, password, options: { data: { hostel_short_code: 'SAT', name: 'Full Name' }}}))
  if meta ? 'hostel_short_code' then
    select id into resolved_hostel_id from hostels where short_code = meta->>'hostel_short_code';
  end if;

  insert into public.profiles (id, entry_number, name, role, hostel_id)
  values (
    new.id,
    split_part(new.email, '@', 1),                          -- entry number = email prefix
    coalesce(meta->>'name', split_part(new.email, '@', 1)),  -- fallback name if none passed
    'student',                                                -- everyone starts as student
    resolved_hostel_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Verify ----------
-- After this runs, every NEW signup automatically gets a profiles row.
-- Existing accounts created before this trigger still need the old
-- manual insert (create-three-test-accounts.sql / quick-test-setup.sql).
