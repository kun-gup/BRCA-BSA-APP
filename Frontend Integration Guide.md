# Frontend Integration Guide — Satpura GC App

Written for someone who knows React/React Native but has never worked
with Supabase. Read this top to bottom once, then use
`FRONTEND_CHEATSHEET.md` as your day-to-day reference.

---

## Part 1: How this is different from a normal backend

**The conventional way** you're probably used to: someone builds a
server with routes like `GET /api/hostels`, `POST /api/scores`. You
call `fetch('https://myapi.com/scores', { method: 'POST', body: ... })`.
Someone had to hand-write every one of those routes, plus the
authentication check inside each one, plus the database query inside
each one.

**This project skips all of that.** Supabase looks at your database
tables and *automatically* generates a REST endpoint for every single
one — you never see the endpoint, you never write it, because the
`supabase-js` library wraps it into a function call:

```js
// This IS a network request to a real auto-generated endpoint.
// You just never have to think about the URL.
const { data, error } = await supabase.from('hostels').select('*');
```

There is no `POST /api/scores` for you to build. There's a `scores`
table, and the moment it exists, `supabase.from('scores').insert(...)`
already works. Same for every table in the database.

**The permission checks are also not something you write.** Normally
you'd write `if (user.role !== 'admin') return 403` inside every route
handler. Here, that rule lives *inside the database itself* (called
Row Level Security / RLS) — written and maintained on the backend side,
not something you touch. If a student tries to edit a score, the
database itself refuses the request and sends back an error — you just
have to handle that error gracefully in the UI, not enforce the rule.

**What you still do, same as any app:** decide what each screen looks
like, manage local state, navigate between screens, show loading
spinners, handle errors nicely. That part is 100% normal React Native
work — nothing about that changes.

---

## Part 2: What you need from us (checklist)

Ask backend for:
- [ ] **Supabase Project URL** (looks like `https://xxxx.supabase.co`)
- [ ] **Supabase anon public key** (a long string starting `eyJ...`)
- [ ] This repo, specifically the `supabase/schema.sql`,
      `supabase/policies.sql`, and `FRONTEND_CHEATSHEET.md` files (so you
      know what tables/columns exist)

You do **NOT** need: a service_role key, database password, or SSH
access to anything. The anon key is the only credential your app ever
uses, and it's safe to embed in the app — it can't bypass RLS.

---

## Part 3: Step-by-step setup

### Step 1 — Install the SDK
```bash
npx expo install @supabase/supabase-js
```

### Step 2 — Store your credentials
Create `.env` in your project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Add `.env` to `.gitignore` immediately (it should already be there).
The `EXPO_PUBLIC_` prefix is required for Expo to expose these to your
app code.

### Step 3 — Create one shared client
`lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,       // keeps the user logged in between app opens
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```
Install `@react-native-async-storage/async-storage` if you don't have it:
```bash
npx expo install @react-native-async-storage/async-storage
```

### Step 4 — Build the signup screen
```js
const { data, error } = await supabase.auth.signUp({
  email: `${entryNumber}@satpura.iitd.ac.in`,
  password,
  options: {
    data: { name: fullName, hostel_short_code: 'SAT' }
    // ^ this metadata is read automatically by a database trigger,
    //   which creates their profile row for you. You don't insert
    //   into `profiles` yourself.
  }
});
```
That's it — no separate "create profile" API call needed. A backend
trigger handles it the instant the account is created.

### Step 5 — Build the login screen
```js
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) { /* show error.message */ }
```

### Step 6 — Keep the session alive across the app
In your root component/context:
```js
useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
  });
  return () => sub.subscription.unsubscribe();
}, []);
```

### Step 7 — Fetch the user's role once, keep it in context
```js
const { data: profile } = await supabase
  .from('profiles')
  .select('name, role, hostel_id')
  .eq('id', user.id)
  .single();
// profile.role tells you which UI to show
```

---

## Part 4: Reading data — example for 3 different screens

**Leaderboard screen:**
```js
const { data, error } = await supabase
  .from('leaderboard_overall')
  .select('*')
  .eq('board_id', brcaBoardId)
  .order('total_points', { ascending: false });

if (error) {
  // network/permission error — show a retry button
} else {
  setLeaderboard(data); // plain array, drop straight into FlatList
}
```

**Notices feed with a filter:**
```js
const { data } = await supabase
  .from('notices')
  .select('*')
  .contains('scopes', ['hostel_specific'])
  .order('created_at', { ascending: false });
```

**A specific student's registrations:**
```js
const { data } = await supabase
  .from('registrations')
  .select('*, events(title, start_date)')  // <- joins the events table inline
  .eq('user_id', user.id);
```
Note the `events(title, start_date)` syntax — this is Supabase's way of
doing a SQL join without you writing SQL. It fetches related rows from
another table in the same call.

---

## Part 5: Writing data — example, and how errors work

```js
const { data, error } = await supabase
  .from('scores')
  .insert({ event_id, hostel_id, points_awarded: 10 });

if (error) {
  // If this user isn't a rep for this activity, error.message will say
  // something like "new row violates row-level security policy" —
  // show a friendly "You don't have permission to do this" message.
  Alert.alert('Error', 'Could not add score: ' + error.message);
} else {
  // success — refresh the leaderboard
}
```

**Key mental shift:** you don't get a `403 Forbidden` HTTP status the
way you might expect from a REST API. You get `{ data: null, error: {...} }`
back from a call that still returned `200 OK` at the network level — the
rejection happens inside Postgres, and `supabase-js` surfaces it as
`error`. Always check `error` before touching `data`.

---

## Part 6: File uploads (rulebook PDFs, photos)

```js
// Sanitize the filename first -- spaces/special characters aren't allowed
const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, '_');
const path = `${activityId}/${Date.now()}-${safeName}`;

const { error: uploadError } = await supabase.storage
  .from('rulebooks')
  .upload(path, file);

const { data } = supabase.storage.from('rulebooks').getPublicUrl(path);
// data.publicUrl -> save this into notices.rulebook_url
```

---

## Part 7: Role-based UI (the part you actually control)

The database blocks unauthorized writes regardless, but you still want
good UX — hide buttons a user can't use rather than showing an error
after they tap it:

```jsx
{(profile.role === 'rep' || profile.role === 'captain' || profile.role === 'vice_captain') && (
  <EditScoreButton />
)}
{profile.role === 'admin' && <AdminPanel />}
```

To check if they specifically own THIS activity (not just any rep role):
```js
const { data } = await supabase
  .from('user_activities')
  .select('activity_id')
  .eq('user_id', user.id);
const ownedActivityIds = data.map(d => d.activity_id);
const canEditThisOne = ownedActivityIds.includes(currentActivityId);
```

---

## Part 8: Realtime (optional — live-updating leaderboard)

```js
useEffect(() => {
  const channel = supabase
    .channel('scores-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' },
      () => { refetchLeaderboard(); }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```

---

## Part 9: Suggested build order

See the top of `FRONTEND_CHEATSHEET.md` — same sequence, don't skip it.
Auth → role context → leaderboard (simplest data screen) → calendar →
notices → everything else → role-gated edit buttons last.

---

## Part 10: Getting stuck

- Every table/column name: `FRONTEND_CHEATSHEET.md`
- What each role can/can't do: `BACKEND_FEATURE_REPORT.md`
- If a query behaves unexpectedly, ask backend to test the exact same
  query in `backend-test-dashboard.html` first — it's the same query
  shape you're writing, just runnable outside the app for debugging.
