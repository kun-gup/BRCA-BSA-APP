-- ============================================================
-- 013_deletes_and_inventory_quantity.sql
-- Run AFTER 012.
--
-- Adds:
-- 1. Notices: poster (or admin) can delete their own notice.
-- 2. Complaints: raiser can withdraw their own complaint, but only
--    while it's still 'open' (not once admin is reviewing/resolved).
-- 3. Deductions: the rep who flagged it can delete it, but only while
--    still 'flagged' (not once admin has confirmed/rejected it).
-- 4. Inventory items: rep/admin can delete an item outright.
-- 5. Inventory checkouts: rep/admin can delete a checkout (error
--    correction) and can mark one as returned without needing a new
--    checkout to replace it (this already worked via the update
--    policy -- just confirming/re-adding here defensively).
-- 6. Partial-quantity checkouts: inventory_checkouts gets a `quantity`
--    column, enforced by a trigger so you can't check out more units
--    than are actually available (e.g. check out 1 of 2 bats, the
--    2nd stays available).
-- 7. inventory_current_status rebuilt to show total/available/checked
--    out quantities correctly, plus the LAST borrower ever (even after
--    return, so the name doesn't disappear).
-- 8. New view inventory_active_checkouts: everyone CURRENTLY holding
--    a unit of an item (handles multiple simultaneous partial
--    checkouts, which a single "current status" row can't show).
-- ============================================================

-- ---------- 1. Notices delete ----------
drop policy if exists "notices_delete_own_or_admin" on notices;
create policy "notices_delete_own_or_admin"
  on notices for delete
  using (is_admin() or auth.uid() = posted_by);

-- ---------- 2. Complaints withdraw (own, only while open) ----------
drop policy if exists "complaints_delete_own_if_open" on complaints;
create policy "complaints_delete_own_if_open"
  on complaints for delete
  using (auth.uid() = raised_by and status = 'open');

-- ---------- 3. Deductions delete (own, only while flagged) ----------
drop policy if exists "deductions_delete_own_if_flagged" on deductions;
create policy "deductions_delete_own_if_flagged"
  on deductions for delete
  using (owns_activity(activity_id) and status = 'flagged');

-- ---------- 4. Inventory items delete ----------
drop policy if exists "inventory_delete_own_activity" on inventory_items;
create policy "inventory_delete_own_activity"
  on inventory_items for delete
  using (owns_activity(activity_id));
-- (admin already has full "for all" access from policies.sql)

-- ---------- 5. Inventory checkouts delete (re-confirmed) ----------
drop policy if exists "checkouts_delete_own_activity_or_admin" on inventory_checkouts;
create policy "checkouts_delete_own_activity_or_admin"
  on inventory_checkouts for delete
  using (
    is_admin() or exists (
      select 1 from inventory_items
      where inventory_items.id = inventory_checkouts.item_id
      and owns_activity(inventory_items.activity_id)
    )
  );

-- ---------- 6. Partial-quantity checkouts ----------
alter table inventory_checkouts add column if not exists quantity integer not null default 1 check (quantity > 0);

create or replace function enforce_checkout_quantity()
returns trigger as $$
declare
  total_qty integer;
  already_out integer;
begin
  select quantity into total_qty from inventory_items where id = new.item_id;
  select coalesce(sum(quantity), 0) into already_out
    from inventory_checkouts
    where item_id = new.item_id and returned_at is null;
  if already_out + new.quantity > total_qty then
    raise exception 'Not enough units available: % of % already checked out, % requested',
      already_out, total_qty, new.quantity;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_checkout_quantity on inventory_checkouts;
create trigger trg_enforce_checkout_quantity
  before insert on inventory_checkouts
  for each row execute function enforce_checkout_quantity();

-- ---------- 7. Rebuild inventory_current_status ----------
drop view if exists analytics_inventory_flags;
drop view if exists inventory_current_status;

create view inventory_current_status
with (security_invoker = true) as
select
  i.id as item_id,
  i.item_name,
  i.activity_id,
  a.board_id,
  a.name as activity_name,
  i.hostel_id,
  i.quantity as total_quantity,
  coalesce(active.checked_out_qty, 0) as checked_out_quantity,
  i.quantity - coalesce(active.checked_out_qty, 0) as available_quantity,
  case
    when coalesce(active.checked_out_qty, 0) = 0 then 'available'
    when coalesce(active.checked_out_qty, 0) < i.quantity then 'partially_checked_out'
    else 'fully_checked_out'
  end as status,
  i.condition,
  last_co.borrower_name as last_borrower_name,
  last_co.borrower_entry_number as last_borrower_entry_number,
  last_co.borrower_phone as last_borrower_phone,
  last_co.issued_at as last_issued_at,
  last_co.returned_at as last_returned_at
from inventory_items i
join activities a on a.id = i.activity_id
left join lateral (
  select sum(quantity) as checked_out_qty
  from inventory_checkouts
  where item_id = i.id and returned_at is null
) active on true
left join lateral (
  -- most recent checkout EVER for this item, whether returned or not --
  -- this is how the last borrower's name stays visible after return.
  select * from inventory_checkouts
  where item_id = i.id
  order by issued_at desc
  limit 1
) last_co on true;

create view analytics_inventory_flags
with (security_invoker = true) as
select * from inventory_current_status
where condition in ('poor','missing');

-- ---------- 8. Who currently holds units right now ----------
create or replace view inventory_active_checkouts
with (security_invoker = true) as
select
  c.id as checkout_id,
  c.item_id,
  i.item_name,
  i.activity_id,
  a.board_id,
  c.quantity,
  c.borrower_name,
  c.borrower_entry_number,
  c.borrower_phone,
  c.issued_at,
  c.expected_return_at
from inventory_checkouts c
join inventory_items i on i.id = c.item_id
join activities a on a.id = i.activity_id
where c.returned_at is null;
