# Satpura GC App — Complete Backend Feature Report

Every feature, what it does, and exactly what a **student / rep-captain-vice_captain / admin** can do with it.

---

## 1. Reference Data — Hostels, Boards, Activities
16 hostels, 2 boards (BRCA/BSA), 26 activities, pre-seeded.
- **Student:** read-only.
- **Rep/Captain/VC:** read-only.
- **Admin:** add/edit/remove.

## 2. Roles & Profiles
`student`, `rep`, `vice_captain`, `captain`, `admin`. One user can hold multiple rep/captain roles across different activities.
- **New signups auto-create a profile** (role=`student`) via database trigger — no manual data entry needed at scale.
- **Student:** edit own name only.
- **Rep/Captain/VC:** same as student.
- **Admin:** change anyone's role/hostel/info.

## 3. Events / Calendar
- **Student:** read-only, can register/cancel own registration.
- **Rep/Captain/VC:** create/edit events for own activity only.
- **Admin:** full control, any activity.

## 4. Registrations
- **Student:** register/cancel self. Cannot see other names.
- **Rep/Captain/VC:** see full registration list for own activity's events.
- **Admin:** sees everything.
- Note: for general engagement (not just formal event capacity), use the **Notice "Interested" button** instead — see #7.

## 5. Scores — Leaderboard
Direct-edit (no approval queue). Two views: `leaderboard_overall`, `leaderboard_by_activity`.
- **Student:** read-only.
- **Rep/Captain/VC:** add/edit/delete scores for **their own activity, across ANY hostel** (they judge the sport/club institute-wide, not just their own hostel).
- **Admin:** add/edit/delete for any activity.

## 6. Deductions
- **Student:** read-only.
- **Rep/Captain/VC:** flag a deduction for own activity; can withdraw it themselves **only while still "flagged"** (locked once admin acts).
- **Admin:** confirm/reject any flagged deduction.

## 7. Notices
Multi-tag (Institute + Hostel + Club/Sport simultaneously), 4 feed filters, "Interested" button with live count + names visible to everyone, rulebook PDF/image upload.
- **Student:** read all notices (with filters), mark/remove "interested."
- **Rep/Captain/VC:** post for own activity, any scope combination (including institute-wide, for inter-hostel/institute events their club runs). Can delete their own posts. Can mute/unmute a club/sport's notices from their own feed.
- **Admin:** post/edit/delete anything, any activity, no activity required.

## 8. Inventory
One item table + full checkout history (not just "last borrower").
- **Partial quantity checkouts supported** — e.g. 2 of 5 bats can be checked out, leaving 3 shown as available. Enforced by a database trigger (can't over-checkout).
- Status per item: `available` / `partially_checked_out` / `fully_checked_out`.
- **Last borrower's name stays visible even after the item is returned** (accountability trail).
- BRCA and BSA inventories are structurally separate (never mixed).
- **Student:** read-only.
- **Rep/Captain/VC:** add/edit/delete items, check out (with quantity), mark returned, cancel a checkout (error correction) — all scoped to own activity.
- **Admin:** full control over any activity's inventory.
- Borrower contact info (phone) restricted to owning rep/admin only.

## 9. Complaints
- **Student/Rep/Captain/VC:** file against any rep/captain/VC. Can read back complaints **they personally filed**, and can **withdraw** while still "open." Cannot see complaints about themselves (the actual anonymity guarantee).
- **Admin:** read/update status of every complaint, sees real identity of who filed it (to catch fake complaints).

## 10. Star Performer of the Month
- **Student:** read-only.
- **Rep/Captain/VC:** nominate for own activity; edit/delete own nominations.
- **Admin:** nominate/edit/delete for any activity.

## 11. Memories / Achievements Gallery
- **Student:** read-only.
- **Rep/Captain/VC:** post for own activity; edit/delete own posts.
- **Admin:** moderate (edit/delete) any post.

## 12. Push Notification Tokens
- **Everyone:** register/remove own device token only.
- **Admin:** read all tokens (needed to actually send notifications server-side).

## 13. Notification Mute Preferences
- **Everyone:** manage own mute list only.

## 14. Admin Activity Log
Fully automatic via database triggers — every score/deduction/notice change and role change is logged, cannot be bypassed by skipping the app.
- **Everyone else:** no access.
- **Admin:** read-only audit trail.

## 15. Analytics Views
`analytics_low_participation`, `analytics_inventory_flags` — admin-only.

## 16. Rulebook Uploads
PDF/PNG/JPEG/WEBP, 10MB cap, via Supabase Storage.
- **Rep/Captain/VC:** upload/delete under own activity's folder.
- **Admin:** any activity.
- **Everyone:** view/download.

---

## Not backend work (frontend/ops responsibility)
- Interactive calendar UI (data's all there in `events`/`registrations`)
- Season-end CSV/PDF export (data's queryable, formatting is a frontend task)
- Actually sending push notifications (token storage is done; the send call itself is a small Edge Function using Expo's push API)
