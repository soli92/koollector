-- Dati minimi per provare push/pull dalla app (UUID fissi per riferimento in codice di test).
-- Esegui dopo db-init.sql:  psql "$DATABASE_URL" -f scripts/seed-dev.sql

insert into users (id, display_name)
values ('11111111-1111-4111-8111-111111111111', 'Dev user')
on conflict (id) do nothing;

insert into collections (id, name, created_by_user_id)
values (
  '22222222-2222-4222-8222-222222222222',
  'Collezione demo',
  '11111111-1111-4111-8111-111111111111'
)
on conflict (id) do nothing;

insert into collection_members (collection_id, user_id, role)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'owner'
)
on conflict (collection_id, user_id) do nothing;
