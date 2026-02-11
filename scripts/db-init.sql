create table if not exists users (
  id uuid primary key,
  display_name text not null,
  created_at timestamptz default now()
);

create table if not exists collections (
  id uuid primary key,
  name text not null,
  created_by_user_id uuid,
  created_at timestamptz default now()
);

create table if not exists collection_members (
  collection_id uuid not null,
  user_id uuid not null,
  role text not null default 'member',
  primary key (collection_id, user_id)
);

-- Sync
create table if not exists sync_events (
  event_id uuid primary key,
  device_id uuid not null,
  actor_user_id uuid not null,
  collection_id uuid not null,
  received_at timestamptz default now()
);

create table if not exists changes (
  cursor bigserial primary key,
  collection_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  op text not null,
  payload jsonb,
  server_ts timestamptz default now()
);
