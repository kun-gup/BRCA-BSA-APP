-- ============================================================
-- policies.sql
-- Security layer (with corrected notices bug).
-- ============================================================

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function owns_activity(target_activity_id uuid)
returns boolean as $$
  select exists (
    select 1 from user_activities
    where user_id = auth.uid() and activity_id = target_activity_id
  );
$$ language sql security definer stable;

-- ---------- PROFILES ----------
alter table profiles enable row level security;

create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (is_admin());

-- ---------- USER_ACTIVITIES ----------
alter table user_activities enable row level security;

create policy "user_activities_select_all" on user_activities for select using (auth.role() = 'authenticated');
create policy "user_activities_admin_write" on user_activities for all using (is_admin());

-- ---------- EVENTS ----------
alter table events enable row level security;

create policy "events_select_all" on events for select using (auth.role() = 'authenticated');
create policy "events_write_own_activity" on events for insert with check (owns_activity(activity_id));
create policy "events_update_own_activity" on events for update using (owns_activity(activity_id));
create policy "events_admin_all" on events for all using (is_admin());

-- ---------- REGISTRATIONS ----------
alter table registrations enable row level security;

create policy "registrations_select_own_or_rep" on registrations for select using (
  auth.uid() = user_id or is_admin() or exists (
    select 1 from events where events.id = registrations.event_id and owns_activity(events.activity_id)
  )
);
create policy "registrations_insert_self" on registrations for insert with check (auth.uid() = user_id);

-- ---------- SCORES ----------
alter table scores enable row level security;

create policy "scores_select_all" on scores for select using (auth.role() = 'authenticated');
create policy "scores_insert_own_activity" on scores for insert with check (
  exists (
    select 1 from events where events.id = scores.event_id and owns_activity(events.activity_id)
  )
);
create policy "scores_admin_update" on scores for update using (is_admin());

-- ---------- DEDUCTIONS ----------
alter table deductions enable row level security;

create policy "deductions_select_all" on deductions for select using (auth.role() = 'authenticated');
create policy "deductions_flag_own_activity" on deductions for insert with check (owns_activity(activity_id));
create policy "deductions_admin_update" on deductions for update using (is_admin());

-- ---------- NOTICES (Bug Fixed) ----------
alter table notices enable row level security;

create policy "notices_select_all" on notices for select using (auth.role() = 'authenticated');

create policy "notices_insert_own_activity"
  on notices for insert
  with check (
    scope = 'activity_specific'
    and owns_activity(activity_id)
  );

create policy "notices_admin_write" on notices for all using (is_admin());

-- ---------- INVENTORY_ITEMS ----------
alter table inventory_items enable row level security;

create policy "inventory_select_all" on inventory_items for select using (auth.role() = 'authenticated');
create policy "inventory_write_own_activity" on inventory_items for insert with check (owns_activity(activity_id));
create policy "inventory_update_own_activity" on inventory_items for update using (owns_activity(activity_id));
create policy "inventory_admin_all" on inventory_items for all using (is_admin());

-- ---------- COMPLAINTS ----------
alter table complaints enable row level security;

create policy "complaints_select_own_or_admin" on complaints for select using (auth.uid() = raised_by or is_admin());
create policy "complaints_insert_self" on complaints for insert with check (auth.uid() = raised_by);
create policy "complaints_admin_update" on complaints for update using (is_admin());

-- ---------- INVENTORY_CHECKOUTS ----------
alter table inventory_checkouts enable row level security;

create policy "checkouts_select_own_activity_or_admin" on inventory_checkouts for select using (
  is_admin() or exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id and owns_activity(inventory_items.activity_id)
  )
);

create policy "checkouts_insert_own_activity" on inventory_checkouts for insert with check (
  exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id and owns_activity(inventory_items.activity_id)
  )
);

create policy "checkouts_update_own_activity_or_admin" on inventory_checkouts for update using (
  is_admin() or exists (
    select 1 from inventory_items where inventory_items.id = inventory_checkouts.item_id and owns_activity(inventory_items.activity_id)
  )
);
