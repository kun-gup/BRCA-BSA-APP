# Satpura GC App
### General Championship Tracker — BRCA & BSA
**Satpura Hostel · IIT Delhi**

---

## Table of Contents
1. [What This App Is](#1-what-this-app-is)
2. [BRCA Clubs & BSA Sports — Full List](#2-brca-clubs--bsa-sports--full-list)
3. [Complete Feature Set](#3-complete-feature-set)
4. [Roles & Permissions](#4-roles--permissions)
5. [Tech Stack — Every Layer Explained](#5-tech-stack--every-layer-explained)
6. [Database Design](#6-database-design)
7. [Will Firebase/Supabase Handle 500 Users?](#7-will-firebasesupabase-handle-500-users)
8. [How Role-Based Versions Work](#8-how-role-based-versions-work)
9. [What You Need to Learn](#9-what-you-need-to-learn)
10. [GitHub Repository Structure & Workflow](#10-github-repository-structure--workflow)
11. [Step-by-Step Build Plan](#11-step-by-step-build-plan)
12. [How to Divide Tasks Across a Team](#12-how-to-divide-tasks-across-a-team)

---

## 1. What This App Is

A single mobile app (Android + iOS) for Satpura hostel that tracks both the **BRCA Cultural Trophy** and the **BSA Sports General Championship** in one place. A toggle on the home screen switches between the two boards. Both sides share the same infrastructure — auth, notices, calendar, inventory, complaints, star performers, and memories — but the data (clubs vs sports, reps vs vice-captains) is scoped accordingly.

**Who uses it:** ~500 Satpura students, club/sport reps, and BRCA/BSA admins.

---

## 2. BRCA Clubs & BSA Sports — Full List

### BRCA Cultural Clubs (12 competitive + 1 non-competitive)

| # | Club Name | Full/Official Name | Competitive |
|---|---|---|---|
| 1 | Drama | Ankahi — Dramatics Club, IIT Delhi | ✅ Yes |
| 2 | Design | Design Club, IIT Delhi | ✅ Yes |
| 3 | PFC | Photography & Films Club (PFC) | ✅ Yes |
| 4 | FACC | Azure — Fine Arts & Crafts Club (FACC) | ✅ Yes |
| 5 | Dance | Dance Club, IIT Delhi (V-Defyn) | ✅ Yes |
| 6 | Hindi Samiti | Hindi Samiti, IIT Delhi | ✅ Yes |
| 7 | Literary | Literary Club (LitClub), IIT Delhi | ✅ Yes |
| 8 | DebSoc | Debating Club (DebSoc), IIT Delhi | ✅ Yes |
| 9 | QC | Quizzing Club (QC), IIT Delhi | ✅ Yes |
| 10 | Music | Music Club (Cadence), IIT Delhi | ✅ Yes |
| 11 | Envogue | Envogue — Fashion Club, IIT Delhi | ✅ Yes |
| 12 | Indradhanu | Indradhanu (inclusive arts club) | ✅ Yes |
| 13 | Spic Macay | Spic Macay, IIT Delhi Chapter | ❌ Non-competitive |

> Note: The BRCA constitution officially lists 10 clubs; the website shows 13 including newer additions (Design, Envogue, Indradhanu). Use the website list as your source of truth since the constitution may be outdated. Confirm with your BRCA admin contact before locking the database.

### BSA Sports (14 sports, all competitive)

| # | Sport |
|---|---|
| 1 | Athletics |
| 2 | Badminton |
| 3 | Basketball |
| 4 | Chess |
| 5 | Cricket |
| 6 | Football |
| 7 | Hockey |
| 8 | Lawn Tennis |
| 9 | Squash |
| 10 | Swimming |
| 11 | Table Tennis |
| 12 | Volleyball |
| 13 | Water Polo |
| 14 | Weightlifting |

---

## 3. Complete Feature Set

Both BRCA and BSA sides share the same features. Where the implementation differs, it is noted.

### 3.1 Board Toggle
- A prominent toggle on the home screen switches between BRCA (cultural) and BSA (sports).
- The entire app — leaderboard, calendar, notices, everything — switches context.
- The toggle state is remembered per session.

### 3.2 Leaderboard
- **Overall view:** total points across all clubs/sports, all 13 hostels ranked.
- **Club/sport-wise view:** filter by one club or sport, see per-hostel ranking.
- Transparent scoring: points awarded + deductions shown separately, never silently netted.
- Satpura's row is highlighted in every view.

### 3.3 Interactive Calendar
- Month-grid view. Events can span multiple days (start date + end date).
- Each cell shows compact pills for that day's events with start/ongoing/end markers.
- Tap a date → list of events that day → tap one → full detail (time, venue, points, rulebook PDF, registration action).
- Hostel-level workshops appear as read-only calendar entries (sourced from notices).
- **Registration counter on event detail:** shows "X of Y spots filled" so reps can see participation and push engagement if numbers are low.

### 3.4 Registration & Participation Tracking
- Two modes per event:
  - **External form link** — app opens the Google Form and records when a student tapped "Register."
  - **In-app notify** — no link, shows "contact your rep."
- **Participation counter visible to reps and admins:** number registered vs capacity. If below a threshold (e.g. < 50% of capacity), reps get an automatic in-app alert to engage more people.
- Students can see total registrations but not individual names (privacy).
- Reps and admins see full registration list.

### 3.5 Notices
- Scoped: institute-wide / hostel-specific / club or sport-specific.
- Categorized: info / registration / results / alert / rule change.
- Pinned notices surface first.
- Optional event date/time on a notice — makes it appear on the calendar as a read-only entry.
- Push notifications on new notices, scoped to who it's relevant for.

### 3.6 Scores & Deductions
- Reps/vice-captains submit score claims after an event.
- Admin verifies before it reflects on the live leaderboard.
- Deductions (post-contention-meet, rule violations, etc.) flagged by reps, confirmed by admin.
- Fixed appeal window (e.g. 48 hours) before a score locks.
- Full audit trail: submitted by, verified by, timestamp.

### 3.7 Inventory
- Per club/sport per hostel: item name, quantity, condition, checked-out to, last updated by.
- Reps can only edit their own club/sport's inventory.
- Low-stock flagging.

### 3.8 Complaints & Queries
- Categories: rep/vice-captain performance, management issue, general query.
- Anonymous to the person being complained about — visible to admin only (enforced at database level, not just UI).
- Status tracking: open → in review → resolved.

### 3.9 Star Performer of the Month ⭐ (NEW)
- Admin nominates 1-3 students per month (one for BRCA, one for BSA, optionally one per club/sport).
- Shown on a dedicated "Wall of Fame" card on the home screen.
- Includes student name, photo (uploaded by admin), achievement description, and month.
- Historical archive: all past star performers browsable.

### 3.10 Memories & Achievements Gallery 📸 (NEW)
- Admins or reps can post a "memory" — a title, description, and a **Google Drive folder link** or **direct photo upload**.
- Tagged by club/sport and year, so it builds into a searchable archive over seasons.
- Categories: competition win, cultural performance, milestone, throwback.
- Students can browse the gallery by club/sport or year.
- This is not a full social feed — no likes, no comments. It is a curated archive, moderated by reps and admins.

### 3.11 Notification Preferences (NEW)
- Students can mute clubs or sports they don't follow.
- Muting a club removes its notices and calendar events from the student's default view (they can still browse manually).

### 3.12 Admin Activity Log (NEW)
- Every score update, deduction, notice post, and user role change is logged with who did it and when.
- Visible only to admin. Prevents silent overwrites when multiple admins operate simultaneously.

### 3.13 Analytics Dashboard for Admin (NEW)
- Events with lowest registration rates (participation health).
- Which clubs/sports have outstanding unverified score claims.
- Inventory items flagged as missing or poor condition.
- Star performer history.
- Exportable as CSV for end-of-season handover.

### 3.14 Season-End Export (NEW)
- Admin can generate a full season summary: final standings, event history, star performers, inventory state.
- Downloads as PDF or CSV. Used for institute records and handover to next year's team.

---

## 4. Roles & Permissions

### BRCA Side

| Role | Who | Scoped To | Permissions |
|---|---|---|---|
| **Student** | All Satpura students | Read-only | View leaderboard, calendar, notices, gallery. Register for events. Raise complaints. |
| **Club Rep** | One per club in Satpura | One club | Submit scores/deductions, manage club inventory, post club notices, view registration list for their club's events. |
| **BRCA Admin** | BRCA organizing team | All | Everything — create/edit events, verify scores, manage users, post any notice, resolve complaints, nominate star performers, manage gallery. |

### BSA Side

| Role | Who | Scoped To | Permissions |
|---|---|---|---|
| **Student** | All Satpura students | Read-only | Same as BRCA student. |
| **Vice Captain** | One per sport in Satpura | One sport | Same as Club Rep but for their sport. |
| **BSA Admin** | BSA organizing team | All | Same as BRCA Admin but for BSA. |

> One student can hold multiple roles — e.g. they can be a Club Rep for Dance (BRCA) and a Vice Captain for Cricket (BSA) simultaneously. The app handles this: their profile shows all their active roles, and they see the relevant rep tools for each.

---

## 5. Tech Stack — Every Layer Explained

This section explains what each technology is, why it was chosen, and what you need to know about it.

### 5.1 Frontend — React Native with Expo

**What it is:** React Native lets you write one codebase in JavaScript/TypeScript that compiles into both an Android app and an iOS app. You do not write Swift (iOS) or Kotlin (Android) separately. Expo is a toolchain that sits on top of React Native and makes setup, testing, and distribution dramatically easier.

**Why React Native over Flutter/native:**
- JavaScript is more widely known and has a much larger community for your use case.
- Expo's managed workflow lets you test the app on your phone instantly via the Expo Go app — no build step needed during development.
- Expo handles push notifications, file storage access, camera, and other device features with simple pre-built packages.

**What you need to learn:**
- JavaScript/TypeScript basics (if not already known).
- React concepts: components, props, state, hooks (useState, useEffect, useContext).
- React Native specific: View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet — these are the building blocks instead of HTML div/p/button.
- React Navigation — the standard library for moving between screens (bottom tabs, stack navigation, drawer navigation).
- Expo packages for specific features (notifications, image picker, linking).

**File structure of a React Native Expo app:**
```
src/
├── screens/          ← One file per screen (LeaderboardScreen, CalendarScreen, etc.)
├── components/       ← Reusable UI pieces (EventCard, BoardRow, NoticeCard)
├── navigation/       ← Navigation config (bottom tabs, stack navigators)
├── hooks/            ← Custom hooks (useLeaderboard, useEvents, useAuth)
├── lib/              ← Supabase client setup, utility functions
├── constants/        ← Colors, fonts, club/sport data
└── types/            ← TypeScript type definitions
```

### 5.2 Backend — Supabase

**What it is:** Supabase is a managed backend platform built on Postgres (a relational database). It gives you a database, authentication (user login/signup), file storage, real-time subscriptions, and an auto-generated REST API — all without you building or hosting a server. You interact with it through the Supabase JavaScript SDK from your React Native app.

**Why Supabase over Firebase:**
- Supabase uses a relational (SQL) database. Your data has clear relationships: a user belongs to a hostel, a score belongs to an event and a hostel, a rep is scoped to a club. SQL handles these relationships naturally and lets you query across them cleanly. Firebase's NoSQL (document) model makes this kind of cross-referencing clumsy.
- **Row Level Security (RLS):** Supabase lets you write rules directly in the database — "a Vice Captain can only update scores where sport_id matches their own." This enforces your permission model at the database layer, not just in app code. A bug in the app cannot bypass it.
- Supabase Auth handles entry-number-based signup, password hashing, and session tokens out of the box.
- The free tier is generous and comfortably handles your scale (see Section 7).

**What you need to learn:**
- Basic SQL: SELECT, INSERT, UPDATE, WHERE, JOIN — enough to write and read your queries.
- How to use the Supabase JavaScript SDK (supabase.from('table').select(), .insert(), .update()).
- How RLS policies are written (they look like SQL WHERE clauses).
- Supabase Auth flow: signUp(), signInWithPassword(), signOut(), onAuthStateChange().
- Supabase Storage: uploadToStorage(), getPublicUrl() — for rulebook PDFs and memory photos.

### 5.3 Push Notifications — Expo Notifications

**What it is:** A service that sends a push notification to a user's phone even when the app is closed. Since you are using Expo, the simplest path is Expo's own push notification service, which wraps both Firebase Cloud Messaging (Android) and APNs (iOS) under one API.

**How it works:**
1. When a user first opens the app, it requests permission and receives a unique push token.
2. You store that token in Supabase against the user's record.
3. When an admin posts a notice or an event is about to happen, your app (or a Supabase Edge Function) sends a request to Expo's push server with the relevant tokens and the notification content.
4. Expo's server forwards it to the device.

**What you need to learn:** The expo-notifications package, how to request permissions, store tokens, and trigger notifications via the Expo push API.

### 5.4 File Storage — Supabase Storage

**What it is:** An S3-compatible file hosting service built into Supabase. You upload files (PDFs, images) to a bucket and get back a public or signed URL.

**Used for:** Rulebook PDFs, memory/achievement photos, star performer profile photos.

**Buckets you'll create:**
- `rulebooks` — public read, write only by admin/reps.
- `memories` — public read, write only by admin/reps.
- `star-performers` — public read, write only by admin.

### 5.5 Google Drive Integration (for Memories)

For bulk photo albums (match day galleries, performance shoots), rather than uploading hundreds of photos individually to Supabase Storage, admins paste a Google Drive folder link. The app stores the URL and opens it in the device browser when tapped. This is intentionally simple — no API integration needed, no OAuth. A Drive folder link is enough for the "glorify past achievements" use case.

---

## 6. Database Design

### Tables

```sql
-- Static reference data
hostels        (id, name, short_code)
  -- 13 hostels, pre-seeded

boards         (id, name)
  -- Two rows: 'BRCA' and 'BSA'

activities     (id, board_id, name, full_name, is_competitive, logo_url)
  -- 13 BRCA clubs + 14 BSA sports
  -- board_id links to boards table

-- Users
profiles       (id, entry_number, name, role, hostel_id, created_at)
  -- id is linked 1:1 to Supabase Auth's auth.users table
  role: 'student' | 'rep' | 'vice_captain' | 'admin'

user_activities (id, user_id, activity_id, hostel_id)
  -- A user can have multiple roles across activities
  -- e.g. Dance Rep + Cricket Vice Captain = two rows here

-- Events & Calendar
events         (id, activity_id, title, type, audience,
                start_date, end_date, time, venue, points,
                rulebook_url, registration_type, registration_link,
                max_participants, status, season, created_by)
  type:              'competitive' | 'non_competitive' | 'institute_workshop'
  audience:          'all' | 'freshers_only'
  registration_type: 'external_link' | 'notify_only'
  status:            'upcoming' | 'ongoing' | 'completed' | 'cancelled'

registrations  (id, event_id, user_id, hostel_id, registered_at)
  -- Tracks who tapped "Register" in the app

-- Scores & Points
scores         (id, event_id, hostel_id, points_awarded,
                status, submitted_by, verified_by,
                appeal_deadline, created_at)
  status: 'pending' | 'verified' | 'contested'

deductions     (id, hostel_id, activity_id, reason, points_deducted,
                flagged_by, confirmed_by, status, created_at)
  status: 'flagged' | 'confirmed' | 'rejected'

-- Notices
notices        (id, board_id, posted_by, scope, hostel_id,
                activity_id, title, body, category, pinned,
                event_date, event_time, created_at)
  scope:    'institute_wide' | 'hostel_specific' | 'activity_specific'
  category: 'info' | 'registration' | 'result' | 'alert' | 'rule_change'

-- Inventory
inventory_items (id, activity_id, hostel_id, item_name,
                 quantity, condition, checked_out_to,
                 last_updated_by, updated_at)

-- Complaints
complaints     (id, raised_by, against_user_id, activity_id,
                category, description, status, created_at)
  category: 'rep_performance' | 'management_issue' | 'general_query'
  status:   'open' | 'in_review' | 'resolved'

-- Star Performers
star_performers (id, board_id, activity_id, user_id,
                 month, year, achievement, photo_url,
                 nominated_by, created_at)

-- Memories Gallery
memories       (id, board_id, activity_id, title, description,
                category, drive_link, cover_photo_url,
                season, posted_by, created_at)
  category: 'competition_win' | 'performance' | 'milestone' | 'throwback'

-- Notifications
push_tokens    (id, user_id, token, platform, updated_at)

-- Audit
activity_log   (id, actor_id, action, table_name, record_id,
                old_value, new_value, created_at)
```

### Key relationships
- A score or deduction is tied to a hostel + an event/activity. The leaderboard computes: `SUM(verified scores) - SUM(confirmed deductions)` grouped by hostel for a given board.
- A notice can belong to a board (BRCA/BSA), optionally to an activity, and optionally to a hostel — giving you the three-tier scoping.
- `user_activities` is the join table that lets one user hold multiple rep/vice-captain roles cleanly.

---

## 7. Will Firebase/Supabase Handle 500 Users?

**Short answer: Yes, easily. 500 users is tiny for either platform.**

Here is the honest comparison for your scale:

| Concern | Firebase Free Tier | Supabase Free Tier |
|---|---|---|
| Users (auth) | 10,000/month | 50,000 total |
| Database reads | 50,000/day | 500MB database, unlimited reads |
| File storage | 5GB | 1GB |
| Simultaneous connections | 100 | Unlimited |
| Monthly active users cap | None | None |

For 500 users generating maybe 10,000 database reads per day (generous estimate), you are at 20% of Firebase's free limit and nowhere near Supabase's.

**The real bottleneck is not users — it is concurrent connections during peak moments** (e.g. everyone checking the leaderboard right after a result drops). Even then, 500 students from one hostel checking an app simultaneously is not a load that challenges either platform at the free tier. Actual enterprise apps handle millions of concurrent users on these same platforms.

**Recommendation stays Supabase** for the reasons in Section 5.2 (relational data, RLS, SQL). Firebase would handle the user count too, but the data model and permission enforcement are harder to get right for your specific structure.

---

## 8. How Role-Based Versions Work

There is **one app, not three separate apps.** The same APK/IPA is installed by everyone. What changes based on the logged-in user's role is what they see and can interact with.

### How it works technically

1. When a user logs in, the app fetches their profile from Supabase (role, hostel_id, their activity assignments from `user_activities`).
2. This is stored in a global React context (a shared state object accessible from any screen).
3. Every screen checks the role before rendering:
   - A "Submit Score" button only renders if `user.role === 'rep' || 'vice_captain'`.
   - The admin activity log screen only renders if `user.role === 'admin'`.
   - A notice posting form only renders if the user has rep/admin privileges.
4. Even if someone somehow bypasses the UI, **Supabase's RLS policies block unauthorized database operations at the server level.** The UI gate and the database gate are independent — you need both, and you have both.

### What each role sees in the app

**Student view:**
- Home, Leaderboard, Calendar, Notices, Star Performers, Memories Gallery, Notification Settings, Complaints form.
- All read-only. Can register for events. Can raise complaints.

**Rep / Vice Captain view:**
- Everything the student sees, plus:
  - "Submit Score" button on completed events.
  - "Flag Deduction" option.
  - "Post Notice" for their own activity.
  - Inventory management screen for their activity.
  - Registration list (with count + names) for their activity's events.
  - "Post Memory" for their activity.

**Admin view:**
- Everything the rep sees across all activities, plus:
  - Unverified scores queue (approve/reject).
  - Deductions queue (confirm/reject).
  - User management (assign roles, add/remove reps).
  - Create/edit/delete events.
  - Nominate star performers.
  - View complaints inbox.
  - Activity log.
  - Analytics dashboard.
  - Season-end export.

### Practical implementation

```javascript
// In any screen component:
const { user } = useAuth(); // global context

return (
  <View>
    <LeaderboardList />
    {(user.role === 'rep' || user.role === 'vice_captain') && (
      <SubmitScoreButton />
    )}
    {user.role === 'admin' && (
      <AdminActionsPanel />
    )}
  </View>
);
```

---

## 9. What You Need to Learn

Ordered from "learn this first" to "learn this when you reach that phase."

### Must know before writing any code
1. **JavaScript fundamentals** — variables, functions, arrays, objects, async/await, arrow functions.
2. **React basics** — components, JSX, props, useState, useEffect. The official React docs are the best source.
3. **Git basics** — commit, push, pull, branch, merge (covered in Section 10).

### Learn during Phase 1-2 (setup + auth)
4. **TypeScript basics** — types, interfaces. Not mandatory but strongly recommended. Prevents an entire class of bugs.
5. **React Native fundamentals** — View, Text, StyleSheet, FlatList, TouchableOpacity.
6. **React Navigation** — createBottomTabNavigator, createNativeStackNavigator.
7. **Supabase JS SDK** — supabase.auth, supabase.from().

### Learn during Phase 3-5 (features)
8. **SQL basics** — SELECT, WHERE, JOIN, GROUP BY, ORDER BY. Supabase uses these under the hood.
9. **RLS policies** — Postgres row-level security syntax.
10. **Supabase Storage** — uploading and retrieving files.
11. **Expo Notifications** — requesting permissions, storing tokens, sending via Expo push API.

### Learn during Phase 6+ (polish)
12. **React Native Reanimated** — for smooth animations (the board toggle, card transitions).
13. **Supabase Realtime** — subscribe to live database changes (leaderboard auto-updating).
14. **EAS Build** — Expo's build service for generating installable APK/IPA files.

### Good free resources
- React Native: official docs at reactnative.dev
- Expo: docs.expo.dev
- Supabase: supabase.com/docs — the quickstart guide is excellent
- SQL: sqlzoo.net or Khan Academy SQL course
- Git: learngitbranching.js.org (interactive, best Git tutorial)

---

## 10. GitHub Repository Structure & Workflow

### Repository name suggestion
`satpura-gc-app`

### Folder structure
```
satpura-gc-app/
│
├── app/                        ← React Native (Expo) source
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── SignupScreen.tsx
│   │   │   ├── brca/
│   │   │   │   ├── LeaderboardScreen.tsx
│   │   │   │   ├── CalendarScreen.tsx
│   │   │   │   ├── NoticesScreen.tsx
│   │   │   │   └── EventDetailScreen.tsx
│   │   │   ├── bsa/
│   │   │   │   └── (same structure as brca/)
│   │   │   ├── shared/
│   │   │   │   ├── StarPerformersScreen.tsx
│   │   │   │   ├── MemoriesScreen.tsx
│   │   │   │   ├── InventoryScreen.tsx
│   │   │   │   └── ComplaintsScreen.tsx
│   │   │   └── admin/
│   │   │       ├── ScoreQueueScreen.tsx
│   │   │       ├── UserManagementScreen.tsx
│   │   │       ├── AnalyticsScreen.tsx
│   │   │       └── ActivityLogScreen.tsx
│   │   ├── components/
│   │   │   ├── BoardRow.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── NoticeCard.tsx
│   │   │   ├── StarPerformerCard.tsx
│   │   │   ├── MemoryCard.tsx
│   │   │   └── BoardToggle.tsx
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── BRCANavigator.tsx
│   │   │   └── BSANavigator.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLeaderboard.ts
│   │   │   ├── useEvents.ts
│   │   │   └── useNotices.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts        ← Supabase client init
│   │   │   └── notifications.ts   ← Expo push helper
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── clubs.ts           ← Static BRCA club list
│   │   │   └── sports.ts          ← Static BSA sports list
│   │   └── types/
│   │       └── index.ts           ← All TypeScript type definitions
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   ├── migrations/                ← SQL files, one per schema change
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_memories.sql
│   │   └── 003_add_star_performers.sql
│   ├── seed.sql                   ← Pre-seed hostels, clubs, sports
│   └── policies.sql               ← All RLS policies in one file
│
├── prototype/
│   └── brca.html                  ← The interactive prototype
│
├── docs/
│   ├── ui-designs/                ← Design mockup exports
│   └── decisions.md               ← Log of key decisions made
│
├── .env.example                   ← Template for env variables (no secrets)
├── .gitignore
├── PROJECT_PLAN.md
└── README.md                      ← This file
```

### Git workflow — how to manage development

**Branch strategy (simple, suitable for a small team):**

```
main          ← Production-ready code only. Never commit directly here.
dev           ← Integration branch. All features merge here first.
feature/xxx   ← One branch per feature being built.
fix/xxx       ← One branch per bug being fixed.
```

**Day-to-day workflow:**
```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feature/leaderboard-screen

# Work on it, commit regularly
git add .
git commit -m "feat: add overall leaderboard with hostel rows"

# When done, push and open a pull request into dev
git push origin feature/leaderboard-screen

# After code review, merge into dev
# When dev is stable and tested, merge dev into main
```

**Commit message conventions (keep it clean from day one):**
- `feat:` — new feature
- `fix:` — bug fix
- `db:` — database schema or policy change
- `style:` — UI/styling only, no logic change
- `docs:` — README or documentation change
- `chore:` — package updates, config changes

**What goes in .gitignore (never commit these):**
```
node_modules/
.env
*.env.local
.expo/
dist/
```

**What goes in .env (never commit, share manually):**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### GitHub features to use
- **Issues** — log every bug and feature request here, not in WhatsApp.
- **Projects (Kanban)** — a free built-in board: To Do, In Progress, Done. Drag issues across.
- **Pull Requests** — even if working solo, open PRs from feature branches into dev. Keeps history clean.
- **GitHub Pages** — enable on main branch to host the prototype HTML publicly.

---

## 11. Step-by-Step Build Plan

### Phase 0 — Environment Setup (1-2 days)
- [ ] Create Supabase project (free tier).
- [ ] Create GitHub repo with the folder structure above.
- [ ] Install Node.js (LTS version), then: `npm install -g expo-cli eas-cli`
- [ ] Run `npx create-expo-app@latest app --template blank-typescript` inside the repo.
- [ ] Install key packages: `@supabase/supabase-js`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `expo-notifications`, `expo-image-picker`.
- [ ] Create `.env` with Supabase keys, add to `.gitignore`.
- [ ] Confirm Expo Go app on your phone can run the blank app via QR scan.

**Done when:** blank app runs on your phone and connects to Supabase successfully.

### Phase 1 — Database & RLS (3-5 days)
- [ ] Run `001_initial_schema.sql` in Supabase SQL editor — creates all tables.
- [ ] Run `seed.sql` — inserts 13 hostels, 2 boards, 13 clubs, 14 sports.
- [ ] Set up Supabase Auth: enable email provider (you will use entry_number@satpura.iitd.ac.in as a fake email format).
- [ ] Write and test all RLS policies in `policies.sql`.
- [ ] Manually create one test account for each role (student, rep, vice_captain, admin).

**Done when:** confirmed via Supabase dashboard that a rep account cannot query another rep's activity data.

### Phase 2 — Auth Screens (3-4 days)
- [ ] Login screen: entry number + password → Supabase signIn.
- [ ] Signup screen: entry number → check allowlist → set password → Supabase signUp.
- [ ] Auth state listener: redirect to home if logged in, login screen if not.
- [ ] Profile fetch on login: load user's role and activity assignments into global context.
- [ ] Basic home shell with logout button.

**Done when:** three test roles can log in and the app knows each one's role and assigned activities.

### Phase 3 — Board Toggle + Navigation Shell (2-3 days)
- [ ] Build the bottom tab navigator: Leaderboard, Calendar, Notices, More.
- [ ] Build the BRCA/BSA toggle component on the home screen.
- [ ] Toggle state stored in React context, propagates to all screens.
- [ ] Screens re-fetch data filtered by the active board when the toggle changes.

**Done when:** toggling between BRCA and BSA visibly changes the active context across tabs.

### Phase 4 — Leaderboard (3-4 days)
- [ ] Query: `SELECT hostel_id, SUM(points_awarded) FROM scores WHERE status='verified' GROUP BY hostel_id` minus deductions, joined with hostels table.
- [ ] Render as ranked list, Satpura highlighted.
- [ ] Overall and per-activity filter tabs.
- [ ] Supabase Realtime subscription for live updates.

### Phase 5 — Calendar & Events (5-7 days)
- [ ] Month-grid calendar component.
- [ ] Multi-day event pills with start/ongoing/end markers.
- [ ] Tap-date → event list → event detail drill-down with back navigation.
- [ ] Event detail: rulebook PDF link (Supabase Storage), registration action.
- [ ] Registration counter on event detail (count of `registrations` rows for that event vs `max_participants`).
- [ ] Admin/rep: create/edit event form with rulebook PDF upload.

### Phase 6 — Notices & Notifications (3-4 days)
- [ ] Notices feed with scope filter (all / institute / hostel / activity).
- [ ] Rep/admin: post notice form with scope selector and optional event date/time.
- [ ] Expo push notification setup: permission request on first launch, token stored in `push_tokens`.
- [ ] Notification triggered on new notice post (Supabase Edge Function or client-side trigger).
- [ ] Notification preferences screen: mute individual activities.

### Phase 7 — Scores & Deductions (4-5 days)
- [ ] Rep: submit score form on completed events.
- [ ] Admin: pending scores queue with approve/reject.
- [ ] Rep: flag deduction form.
- [ ] Admin: pending deductions queue.
- [ ] Appeal window countdown on pending scores.
- [ ] Leaderboard auto-updates after verification.

### Phase 8 — Star Performers (2-3 days)
- [ ] Admin: nominate star performer form (select user, month, achievement text, upload photo).
- [ ] Home screen "Star of the Month" card showing current nominee.
- [ ] Wall of Fame screen: all past nominees, browsable by month and activity.

### Phase 9 — Memories Gallery (2-3 days)
- [ ] Rep/admin: post memory form (title, description, category, Google Drive link or photo upload).
- [ ] Gallery screen: grid of memory cards, filterable by activity and season.
- [ ] Memory detail: full description + Drive link button or photo viewer.

### Phase 10 — Inventory & Complaints (3-4 days)
- [ ] Inventory screen: list of items for the user's activity (read for students, edit for reps).
- [ ] Rep: add/edit/check-out inventory item.
- [ ] Complaints: student submission form.
- [ ] Admin: complaints inbox with status management.

### Phase 11 — Admin Extras (3-4 days)
- [ ] Activity log screen (admin only).
- [ ] Analytics dashboard: participation rates, outstanding queues, inventory flags.
- [ ] Season-end export: generate CSV of final standings and event history.

### Phase 12 — Testing & Launch (1 week)
- [ ] Internal test: 5-10 students across roles use the app for a real week.
- [ ] Fix RLS edge cases and UX confusion points.
- [ ] Run `eas build --platform android` to generate an APK.
- [ ] Distribute APK via a shared link (no Play Store needed for a hostel-internal app).
- [ ] iOS requires an Apple Developer account ($99/year) — decide if iOS is in scope.

---

## 12. How to Divide Tasks Across a Team

If you have 2-4 people working on this, here is a clean split:

| Person | Owns |
|---|---|
| **Lead / Backend** | Supabase schema, RLS policies, all data queries, auth flow, Supabase Edge Functions for notifications. |
| **Frontend A** | Leaderboard, Calendar, Event Detail, Score submission screens. |
| **Frontend B** | Notices, Memories, Star Performers, Inventory, Complaints screens. |
| **Frontend C (optional)** | Admin screens (score queue, analytics, user management, activity log). |

Everyone works on their own feature branches and merges into `dev`. The Lead reviews and merges PRs.

---

## Open Decisions (Settle Before Phase 1)

- [ ] **Season ID:** will historical seasons (2024-25, 2025-26, etc.) live in the same database? If yes, add `season TEXT` to `events` and `scores` now.
- [ ] **iOS support:** requires Apple Developer account. Android-only at launch is a valid choice.
- [ ] **Entry number format:** confirm the exact format (e.g. 2023CS10123) for the allowlist validation regex.
- [ ] **Which clubs are exactly in scope:** confirm the 13 clubs with your BRCA admin — the constitution lists 10, the website shows 13. Lock this before seeding the database.
- [ ] **Memories moderation:** can any rep post memories, or does admin approve first?
