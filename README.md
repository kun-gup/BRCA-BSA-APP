# Satpura GC App — Backend

Backend for the Satpura Games Committee tracker (BRCA cultural clubs +
BSA sports), built on **Supabase** (Postgres + Auth + Storage + Row
Level Security).

## Stack
Postgres (Supabase) · Supabase Auth · Supabase Storage · RLS for all
permission enforcement (not just UI-hidden — a student cannot edit a
score even by calling the API directly).

## Setup — fresh project
Run these 3 files in SQL Editor, in order:
```
supabase/schema.sql
supabase/policies.sql
supabase/seed.sql
```
Grab your Project URL + anon key from Settings → API Keys → "Legacy
anon, service_role API keys" tab.

`supabase/migrations/` is a historical changelog only — don't run it on
a fresh project, use the 3 files above instead. See its own README.

## Roles
| Role | Scope |
|---|---|
| `student` | Read-only + register for events + mark notices "interested" + file/withdraw complaints. Auto-created on signup via a database trigger — no manual onboarding needed for the ~500 students. |
| `rep` | Same as student + full control over their **one assigned BRCA club** |
| `captain` / `vice_captain` | Same as `rep`, for **one assigned BSA sport**. Equal permissions, a sport can have both roles at once. |
| `admin` | Full control over everything, any club/sport, any hostel |

## Full feature list + exact per-role permissions
See `BACKEND_FEATURE_REPORT.md`.

## Frontend integration
Start with `FRONTEND_INTEGRATION_GUIDE.md` (step-by-step, written for
someone new to Supabase), then use `FRONTEND_CHEATSHEET.md` as a daily
reference. No custom API exists — every table/view is queried directly:
```js
const { data, error } = await supabase.from('leaderboard_overall').select('*');
```

## Testing
- **Manual:** `backend-test-dashboard.html` — open directly in a
  browser, connect with your Project URL + anon key, sign in with a
  test account. Not part of the shipped app.
- **Automated:** `tests/rls-tests.mjs` — `cd tests && npm install`,
  fill in `.env` (see `.env.example`), `npm test`. Creates throwaway
  test accounts, runs RLS assertions, cleans up automatically.

## License
Internal project for Satpura Hostel, IIT Delhi. Not for external distribution.
