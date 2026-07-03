-- ============================================================
-- policies.sql
-- CONSOLIDATED final-state Row Level Security rules.
-- Run AFTER schema.sql, BEFORE or AFTER seed.sql (order doesn't matter
-- between those two).
-- ============================================================

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

create or replace function owns_activity(target_activity_id uuid)
returns boolean as $$
  select exists (select 1 from user_activities where user_id = auth.uid() and activity_id = target_activity_id);
$$ language sql security definer stable;

-- ---------- Reference data (hostels/boards/activities) ----------
alter table hostels enable row level security;
create policy "hostels_select_all" on hostels for select using (true);
create policy "hostels_admin_write" on hostels for all using (is_admin());

alter table boards enable row level security;
create policy "boards_select_all" on boards for select using (true);
create policy "boards_admin_write" on boards for all using (is_admin());

alter table activities enable row level security;
create policy "activities_select_all" on activities for select using (true);
create policy "activities_admin_write" on activities for all using (is_admin());

-- ---------- Profiles ----------
alter table profiles enable row level security;
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (is_admin());

-- ---------- User Activities ----------
alter table user_activities enable row level security;
create policy "user_activities_select_all" on user_activities for select using (auth.role() = 'authenticated');
create policy "user_activities_admin_write" on user_activities for all using (is_admin());

-- ---------- Events ----------
alter table events enable row level security;
create policy "events_select_all" on events for select using (auth.role() = 'authenticated');
create policy "events_write_own_activity" on events for insert with check (owns_activity(activity_id));
create policy "events_update_own_activity" on events for update using (owns_activity(activity_id));
create policy "events_admin_all" on events for all using (is_admin());

-- ---------- Registrations ----------
alter table registrations enable row level security;
create policy "registrations_select_own_or_rep" on registrations for select using (
  auth.uid() = user_id or is_admin() or exists (
    select 1 from events where events.id = registrations.event_id and owns_activity(events.activity_id)
  )
);
create policy "registrations_insert_self" on registrations for insert with check (auth.uid() = user_id);
create policy "registrations_delete_self" on registrations for delete using (auth.uid() = user_id);

-- ---------- Scores ----------
alter table scores enable row level security;
create policy "scores_select_all" on scores for select using (auth.role() = 'authenticated');
create policy "scores_write_own_activity" on scores for insert with check (
  exists (select 1 from events where events.id = scores.event_id and owns_activity(events.activity_id))
);
create policy "scores_update_own_activity" on scores for update using (
  exists (select 1 from events where events.id = scores.event_id and owns_activity(events.activity_id))
);
create policy "scores_delete_own_activity" on scores for delete using (
  exists (select 1 from events where events.id = scores.event_id and owns_activity(events.activity_id))
);
create policy "scores_admin_all" on scores for all using (is_admin());

-- ---------- Deductions ----------
alter table deductions enable row level security;
create policy "deductions_select_all" on deductions for select using (auth.role() = 'authenticated');
create policy "deductions_flag_own_activity" on deductions for insert with check (owns_activity(activity_id));
create policy "deductions_admin_update" on deductions for update using (is_admin());
create policy "deductions_delete_own_if_flagged" on deductions for delete using (
  owns_activity(activity_id) and status = 'flagged'
);

-- ---------- Notices ----------
alter table notices enable row level security;
create policy "notices_select_all" on notices for select using (auth.role() = 'authenticated');
create policy "notices_insert_rep" on notices for insert with check (
  activity_id is not null and owns_activity(activity_id) and 'activity_specific' = any(scopes)
);
create policy "notices_admin_write" on notices for all using (is_admin());
create policy "notices_delete_own_or_admin" on notices for delete using (
  is_admin() or auth.uid() = posted_by
);

-- ---------- Notice Interests ----------
alter table notice_interests enable row level security;
create policy "notice_interests_select_all" on notice_interests for select using (auth.role() = 'authenticated');
create policy "notice_interests_insert_self" on notice_interests for insert with check (auth.uid() = user_id);
create policy "notice_interests_delete_self" on notice_interests for delete using (auth.uid() = user_id);

-- ---------- Inventory Items ----------
alter table inventory_items enable row level security;
create policy "inventory_select_all" on inventory_items for select using (auth.role() = 'authenticated');
create policy "inventory_write_own_activity" on inventory_items for insert with check (owns_activity(activity_id));
create policy "inventory_update_own_activity" on inventory_items for update using (owns_activity(activity_id));
create policy "inventory_delete_own_activity" on inventory_items for delete using (owns_activity(activity_id));
create policy "inventory_admin_all" on inventory_items for all using (is_admin());

-- ---------- Inventory Checkouts ----------
alter table inventory_checkouts enable row level security;
create policy "checkouts_select_own_activity_or_admin" on inventory_checkouts for select using (
  is_admin() or exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id
    and owns_activity(inventory_items.activity_id)
  )
);
create policy "checkouts_insert_own_activity" on inventory_checkouts for insert with check (
  exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id
    and owns_activity(inventory_items.activity_id)
  )
);
create policy "checkouts_update_own_activity_or_admin" on inventory_checkouts for update using (
  is_admin() or exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id
    and owns_activity(inventory_items.activity_id)
  )
);
create policy "checkouts_delete_own_activity_or_admin" on inventory_checkouts for delete using (
  is_admin() or exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id
    and owns_activity(inventory_items.activity_id)
  )
);

-- ---------- Complaints ----------
alter table complaints enable row level security;
create policy "complaints_select_own_or_admin" on complaints for select using (
  auth.uid() = raised_by or is_admin()
);
create policy "complaints_insert_self" on complaints for insert with check (auth.uid() = raised_by);
create policy "complaints_admin_update" on complaints for update using (is_admin());
create policy "complaints_delete_own_if_open" on complaints for delete using (
  auth.uid() = raised_by and status = 'open'
);

-- ---------- Star Performers ----------
alter table star_performers enable row level security;
create policy "star_performers_select_all" on star_performers for select using (auth.role() = 'authenticated');
create policy "star_performers_insert_own_activity" on star_performers for insert with check (
  is_admin() or (activity_id is not null and owns_activity(activity_id))
);
create policy "star_performers_update_own_or_admin" on star_performers for update using (
  is_admin() or auth.uid() = nominated_by
);
create policy "star_performers_delete_own_or_admin" on star_performers for delete using (
  is_admin() or auth.uid() = nominated_by
);

-- ---------- Memories ----------
alter table memories enable row level security;
create policy "memories_select_all" on memories for select using (auth.role() = 'authenticated');
create policy "memories_insert_own_activity" on memories for insert with check (
  activity_id is null or owns_activity(activity_id)
);
create policy "memories_update_own_or_admin" on memories for update using (
  is_admin() or auth.uid() = posted_by
);
create policy "memories_delete_own_or_admin" on memories for delete using (
  is_admin() or auth.uid() = posted_by
);

-- ---------- Push Tokens ----------
alter table push_tokens enable row level security;
create policy "push_tokens_own" on push_tokens for all using (auth.uid() = user_id);
create policy "push_tokens_admin_read" on push_tokens for select using (is_admin());

-- ---------- Notification Mutes ----------
alter table user_activity_mutes enable row level security;
create policy "mutes_own" on user_activity_mutes for all using (auth.uid() = user_id);

-- ---------- Admin Activity Log ----------
alter table activity_log enable row level security;
create policy "activity_log_admin_only" on activity_log for select using (is_admin());

-- ---------- Storage: rulebooks bucket ----------
create policy "rulebooks_read_all" on storage.objects for select using (bucket_id = 'rulebooks');
create policy "rulebooks_upload_own_activity" on storage.objects for insert with check (
  bucket_id = 'rulebooks' and (is_admin() or owns_activity((split_part(name, '/', 1))::uuid))
);
create policy "rulebooks_delete_own_activity" on storage.objects for delete using (
  bucket_id = 'rulebooks' and (is_admin() or owns_activity((split_part(name, '/', 1))::uuid))
);
