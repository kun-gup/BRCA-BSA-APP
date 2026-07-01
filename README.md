# BRCA-APP
BRCA Trophy App — Satpura Hostel, IIT Delhi
<br>
Roles
Role	Scope	Can do
Student	Read-only	View leaderboard, schedule, notices. Raise complaints/queries.
Club Representative	One hostel + one club	Register participants for events, submit score/deduction claims, post club-scoped notices, manage their club's inventory at their hostel.
Admin	Institute-wide	Everything — create events, verify/finalize scores, confirm deductions, manage users and roles, post institute/hostel-wide notices, resolve complaints.
Core Features
Authentication
•	Sign-in via entry number + password.
•	One-time signup: student enters entry number, app checks it against an admin-provided allowlist, student sets their own password.
•	Passwords are hashed and never visible to admins or developers — handled by Supabase Auth, not custom-built.
Leaderboard
•	Overall view — total points across all clubs, ranked across all 13 hostels institute-wide.
•	Club-wise view — pick a club (Dance, Music, Drama, Fine Arts, etc.), see all hostels ranked within that club.
•	Satpura's own row is visually highlighted in both views.
•	Transparent ledger: total = points awarded minus confirmed deductions, both shown separately (never silently netted).
Schedule
•	Interactive tabular (month-grid) calendar, not just a list.
•	Events can span multiple days (start_date to end_date). Each date cell shows compact pills for that day's events: 
o	A "starts" marker on the event's first day
o	An "ends" marker on its last day
o	A softer/ongoing style for days in between
o	Single-day events shown plainly
o	If more than 2 events land on one day, a "+N more" indicator appears rather than cluttering the cell
•	Drill-down interaction: tapping a date opens a simple list of just that day's event names (with a status tag: starts today / ongoing / ends today / today). Tapping a specific event from that list expands into a full detail view — category, points, date range, time, venue, rulebook, and registration action. A back action returns to the day's event list.
•	Each event has an attached rulebook (PDF, stored in Supabase Storage, linked via rulebook_url).
•	Competitive events, freshers-only events, non-competitive club events, and institute-level workshops all appear as full calendar entries.
•	Hostel-level workshops appear on the same calendar as read-only entries (sourced from notices with an attached date/time, not a full event record) — no RSVP, just informational.
•	Notifications: reminders before an event, alerts when registration opens, and deadline reminders for events with a registration link.
Registration
•	Mixed mode per event: 
o	External link : event links out to a Google Form (or similar); the app surfaces the link as a button and notifies students when registration opens.
o	Notify only : no link; the app shows an in-app notice (e.g. "registrations open, contact your rep") with no external action.
•	Optional capacity limits with waitlist for events that need it (e.g. limited-seat workshops).
Notices
•	Scoped to institute-wide, hostel-specific, or club-specific.
•	Categorized: info, registration, results, alerts.
•	Pinned notices surface first.
•	Notices can optionally carry an event_date/event_time, which is how hostel-level workshops surface on the calendar.
Scores & Deductions
•	Reps submit score claims after an event; Admin verifies before it counts on the live leaderboard.
•	Reps flag deductions (e.g. after a contention meet); Admin confirms or rejects.
•	Fixed appeal window after a score is posted, during which a rep can formally contest it before it locks.
•	Full audit trail: who submitted, who verified, when.
Inventory
•	Tracked per club per hostel (each hostel's club has its own gear, separate from other hostels).
•	Item, quantity, condition, checked-out status, last updated by.
Complaints & Queries
•	Categories: rep performance, management issue, general query.
•	Complaints against a rep are visible to Admin only, the rep in question never sees who filed it. Enforced at the database level.
•	Status tracking: open → in review → resolved.
Additional Features ( Still need to discuss)
A few things worth considering that weren't in the original scope, based on common pain points in systems like this:
•	Notification preferences :with institute, hostel, and club-scoped notices all stacking up, students should be able to mute clubs they're not part of, to avoid notification fatigue.
•	Admin activity log :a simple running feed of who changed what (scores, deductions, notices) and when. Useful once there's more than one admin, so nothing gets silently overwritten or disputed after the fact.
•	Lightweight analytics for admins : most-registered events, hostels with low participation, frequently-missing inventory items. Useful input for next year's planning, not just this year's operations.
•	Season-end export : generate a PDF/CSV summary (final standings, event history, inventory state) for institute records and handover to the next BRCA organizing team.
•	Event capacity + waitlist : already noted above under Registrations, but worth calling out as its own feature since workshops in particular tend to have room limits.
Database (Supabase / Postgres)
hostels (id, name, short_code)
  -- all 13 hostels present, for leaderboard purposes;
  -- app usage (auth, registrations, inventory, complaints) is Satpura-only

clubs (id, name, is_competitive)

users (id, entry_number, password_hash, name, role, hostel_id, club_id*)
  role: student | rep | admin
  club_id only populated for reps
  hostel_id fixed to Satpura for all app users

events (id, club_id, title, type, audience, start_date, end_date, time,
        venue, points, rulebook_url, registration_type, registration_link,
        max_participants, status)
  type: competitive | non_competitive | institute_workshop
  audience: all | freshers_only
  registration_type: external_link | notify_only
  status: upcoming | ongoing | completed | cancelled

registrations (id, event_id, hostel_id, participant_names,
               registered_by_user_id, created_at)

scores (id, event_id, hostel_id, points_awarded, status,
        submitted_by, verified_by, appeal_deadline, created_at)
  status: pending | verified | contested

deductions (id, hostel_id, club_id, reason, points_deducted,
            flagged_by, confirmed_by, status, created_at)
  status: flagged | confirmed | rejected

inventory_items (id, club_id, hostel_id, item_name, quantity,
                  condition, checked_out_to, last_updated_by, updated_at)

complaints (id, raised_by_user_id, against_user_id*, category,
            description, status, created_at)
  category: rep_performance | management_issue | general_query
  status: open | in_review | resolved
  visible only to admin role (RLS-enforced)

notices (id, posted_by, scope, hostel_id*, club_id*, title, body,
         category, pinned, event_date*, event_time*, created_at)
  scope: institute_wide | hostel_specific | club_specific
  event_date/event_time optional — populates calendar for
  hostel-level workshops without creating a full event record

