-- ============================================================
-- 002_add_notices_inventory_complaints.sql
-- ============================================================

create table notices (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  posted_by uuid references profiles(id),
  scope text not null default 'institute_wide'
    check (scope in ('institute_wide', 'hostel_specific', 'activity_specific')),
  hostel_id uuid references hostels(id),
  activity_id uuid references activities(id),
  title text not null,
  body text not null,
  category text not null default 'info'
    check (category in ('info', 'registration', 'result', 'alert', 'rule_change')),
  pinned boolean not null default false,
  event_date date,
  event_time time,
  created_at timestamptz not null default now()
);

create index idx_notices_board on notices(board_id);
create index idx_notices_activity on notices(activity_id);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  hostel_id uuid not null references hostels(id),
  item_name text not null,
  quantity integer not null default 0,
  condition text not null default 'good'
    check (condition in ('good', 'fair', 'poor', 'missing')),
  checked_out_to text,
  last_updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

create index idx_inventory_activity on inventory_items(activity_id);

create table complaints (
  id uuid primary key default gen_random_uuid(),
  raised_by uuid references profiles(id),
  against_user_id uuid references profiles(id),
  activity_id uuid references activities(id),
  category text not null
    check (category in ('rep_performance', 'management_issue', 'general_query')),
  description text not null,
  status text not null default 'open'
    check (status in ('open', 'in_review', 'resolved')),
  created_at timestamptz not null default now()
);
