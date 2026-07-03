# Frontend Cheatsheet — Satpura GC App

Everything you need to connect React Native screens to the backend.
No custom API exists — every table/view below is queried directly
through the Supabase client.

## Is this backend comfortable to work with?

Short answer: yes, if you already know React/React Native. There's no
custom REST API to learn, no separate backend server, no manual auth
token handling — the Supabase SDK does that. The only mental shift is:
**there's no backend team to ask "what's the endpoint for X" — the
table name IS the endpoint.** Everything below tells you exactly which
table/view to query for each screen.

## Suggested build order (do it in this sequence)

1. **Auth screens** (Login/Signup) — get `supabase.auth` working first,
   nothing else works without a logged-in user.
2. **Home shell + role detection** — fetch the signed-in user's `profiles`
   row, store `role` + `hostel_id` in a global context (React Context or
   Zustand). Every other screen reads from this instead of re-fetching.
3. **BRCA/BSA toggle + bottom tab navigation** — just UI state, no queries yet.
4. **Leaderboard screen** — simplest data screen, good first real query
   (`leaderboard_overall`, `leaderboard_by_activity`).
5. **Calendar/Events screen** — `events` + `registrations` count.
6. **Notices screen** — includes the scopes[] filter + "interested" toggle,
   slightly more involved, do after you're comfortable with basic queries.
7. **Inventory + Complaints + Star Performers + Memories** — same CRUD
   pattern repeated, do these last since they're all similar shape.
8. **Role-gated edit UI last** — once read-only screens work, add the
   `{role === 'rep' && <EditButton/>}` conditionals. The database already
   blocks unauthorized writes, so this step is about UX polish, not security.

## Setup (once)

```
npm install @supabase/supabase-js
```

`lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```
Get the URL/key from whoever's doing backend (Supabase dashboard →
Settings → API Keys → "Legacy anon, service_role" tab → copy the `anon` key).

## Auth

```js
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
supabase.auth.onAuthStateChange((event, session) => { /* update your app state */ });
const { data: { user } } = await supabase.auth.getUser();
```
Email format used: `entrynumber@satpura.iitd.ac.in`.

After signup, the user also needs a row in `profiles` (name/role/hostel) —
this is a separate insert, not automatic.

## Reading your logged-in user's profile/role

```js
const { data: profile } = await supabase
  .from('profiles')
  .select('name, role, hostel_id, hostels(short_code)')
  .eq('id', user.id)
  .single();
// profile.role is 'student' | 'rep' | 'vice_captain' | 'captain' | 'admin'
```
Use `profile.role` to decide which buttons to show (edit score, post
notice, etc.) — but remember the database enforces the real rule even
if you forget a UI check.

To check if the user owns a *specific* activity (needed to show "Edit"
only for their club/sport):
```js
const { data } = await supabase
  .from('user_activities')
  .select('activity_id')
  .eq('user_id', user.id);
// data is an array of activity_ids they're a rep/captain for
```

## Every table & view

| Name | Type | Purpose | Key columns |
|---|---|---|---|
| `hostels` | table | 16 hostels | `id, name, short_code` |
| `boards` | table | BRCA / BSA | `id, name` |
| `activities` | table | 26 clubs/sports | `id, board_id, name, full_name, is_competitive` |
| `profiles` | table | User info | `id, entry_number, name, role, hostel_id` |
| `user_activities` | table | Who reps what | `user_id, activity_id, hostel_id` |
| `events` | table | Calendar entries | `id, activity_id, title, start_date, end_date, time, venue, points, registration_type, registration_link, max_participants, status, rulebook_url` |
| `registrations` | table | Event signups | `event_id, user_id, hostel_id, registered_at` |
| `scores` | table | Points per event/hostel | `event_id, hostel_id, points_awarded` |
| `deductions` | table | Penalties | `hostel_id, activity_id, reason, points_deducted, status` |
| `notices` | table | Announcements | `id, board_id, activity_id, hostel_id, scopes[], title, body, category, pinned, rulebook_url` |
| `notice_interests` | table | "Interested" taps | `notice_id, user_id` |
| `inventory_items` | table | Equipment | `id, activity_id, hostel_id, item_name, quantity, condition` |
| `inventory_checkouts` | table | Issue history | `item_id, borrower_name, borrower_entry_number, borrower_phone, issued_at, returned_at` |
| `complaints` | table | Write-only for non-admin | `category, description, raised_by, against_user_id, status` |
| `star_performers` | table | Monthly nominees | `board_id, activity_id, user_id, month, year, achievement, photo_url` |
| `memories` | table | Achievement gallery | `board_id, activity_id, title, description, category, drive_link, cover_photo_url` |
| `push_tokens` | table | Device push tokens | `user_id, token, platform` |
| `user_activity_mutes` | table | Muted clubs/sports | `user_id, activity_id` |
| `activity_log` | table | Admin-only audit trail | (admin screens only) |
| `leaderboard_overall` | view | Per-board, per-hostel totals | `board_id, hostel_id, hostel_name, short_code, total_points` |
| `leaderboard_by_activity` | view | Per-club/sport totals | `activity_id, activity_name, board_id, hostel_id, total_points` |
| `inventory_current_status` | view | Live item status | `item_id, item_name, board_id, status, borrower_name, borrower_entry_number, borrower_phone, issued_at` |
| `notice_interest_counts` | view | Interest counts | `notice_id, interested_count` |
| `analytics_low_participation` | view | Admin dashboard | `event_id, title, fill_percent` |
| `analytics_inventory_flags` | view | Admin dashboard | poor/missing items |

## Common query patterns

**Leaderboard (BRCA or BSA):**
```js
const { data } = await supabase
  .from('leaderboard_overall')
  .select('*')
  .eq('board_id', brcaBoardId)
  .order('total_points', { ascending: false });
```

**Calendar for an activity:**
```js
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('activity_id', activityId)
  .gte('start_date', monthStart)
  .lte('end_date', monthEnd);
```

**Registration count for an event ("X of Y spots filled"):**
```js
const { count } = await supabase
  .from('registrations')
  .select('*', { count: 'exact', head: true })
  .eq('event_id', eventId);
```

**Add a score (rep/captain only — will error for anyone else):**
```js
await supabase.from('scores').insert({ event_id, hostel_id, points_awarded: 10 });
```

**Notices feed, filtered by scope:**
```js
const { data } = await supabase
  .from('notices')
  .select('*')
  .contains('scopes', ['hostel_specific'])   // or 'institute_wide' / 'activity_specific'
  .order('created_at', { ascending: false });
```

**Post a notice (rep/captain, own activity only):**
```js
await supabase.from('notices').insert({
  board_id, activity_id, hostel_id,
  scopes: ['activity_specific', 'hostel_specific'],  // never include 'institute_wide' unless admin
  title, body
});
```

**Toggle "interested":**
```js
// add
await supabase.from('notice_interests').insert({ notice_id, user_id });
// remove
await supabase.from('notice_interests').delete().eq('notice_id', notice_id).eq('user_id', user_id);
```

**Inventory for one board:**
```js
const { data } = await supabase
  .from('inventory_current_status')
  .select('*')
  .eq('board_id', boardId);
```

**Check out an item:**
```js
await supabase.from('inventory_checkouts').insert({
  item_id, borrower_name, borrower_entry_number, borrower_phone, issued_by: user.id
});
```

**File a complaint (write-only — you cannot read it back):**
```js
await supabase.from('complaints').insert({ category, description, raised_by: user.id, against_user_id });
```

**Upload a rulebook file:**
```js
const path = `${activityId}/rulebook.pdf`;
await supabase.storage.from('rulebooks').upload(path, file);
const { data } = supabase.storage.from('rulebooks').getPublicUrl(path);
// save data.publicUrl into notices.rulebook_url
```

## Error handling

Every call returns `{ data, error }`. A permission violation (RLS
rejecting the request) comes back as a non-null `error`, not a thrown
exception and not silently-empty data — always check `error` before
using `data`.

```js
const { data, error } = await supabase.from('scores').insert({...});
if (error) {
  // e.g. student tried to edit a score -> show a friendly message
  console.log(error.message);
}
```

## Realtime (optional, for live leaderboard updates)

```js
supabase
  .channel('scores-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, payload => {
    // refetch leaderboard_overall here
  })
  .subscribe();
```
