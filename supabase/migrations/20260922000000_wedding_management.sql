-- Rovty team operations. No new cross-wedding privileges for browser roles.
begin;

create table public.rovty_staff (
  email text primary key check (email = lower(trim(email))),
  role text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);
alter table public.rovty_staff enable row level security;
revoke all on public.rovty_staff from public, anon, authenticated;
grant all on public.rovty_staff to service_role;
insert into public.rovty_staff(email, role) values ('ireshek@gmail.com', 'admin');

create table public.wedding_admin_audit (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  actor_id uuid not null,
  actor_email text not null,
  action text not null,
  reason text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index wedding_admin_audit_recent on public.wedding_admin_audit(wedding_id, created_at desc);
alter table public.wedding_admin_audit enable row level security;
revoke all on public.wedding_admin_audit from public, anon, authenticated;
grant select, insert on public.wedding_admin_audit to service_role;

create function public.rovty_wedding_metrics(_id uuid) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'guests', count(*), 'seats', coalesce(sum(g.seats), 0),
    'invited', count(*) filter (where g.invited_at is not null),
    'attending', count(*) filter (where r.attending = true),
    'declined', count(*) filter (where r.attending = false),
    'pending', count(*) filter (where r.id is null),
    'confirmedSeats', coalesce(sum(g.seats) filter (where r.attending = true), 0),
    'assigned', count(*) filter (where a.id is not null),
    'tables', (select count(*) from public.seating_tables t where t.wedding_id = _id and t.is_active),
    'capacity', (select coalesce(sum(t.capacity), 0) from public.seating_tables t where t.wedding_id = _id and t.is_active)
  ) from public.guests g
  left join public.rsvps r on r.wedding_id = g.wedding_id and r.guest_code = g.code
  left join public.seating_assignments a on a.wedding_id = g.wedding_id and a.guest_code = g.code
  where g.wedding_id = _id;
$$;
revoke all on function public.rovty_wedding_metrics(uuid) from public, anon, authenticated;
grant execute on function public.rovty_wedding_metrics(uuid) to service_role;

-- Called only by the Worker after verifying the bearer token with Supabase Auth.
-- Recheck the approved, confirmed account in the same transaction as each action.
create function public.rovty_manage(_actor uuid, _action text, _params jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  _email text; _role text; _id uuid; _q text; _filter text;
  _page int; _total int; _items jsonb; _summary jsonb; _patch jsonb;
  _reason text; _before jsonb; _after jsonb;
  _w public.weddings; _new public.weddings;
  _guest public.guests; _new_guest public.guests;
  _member public.wedding_members; _member_user uuid;
  _table public.seating_tables; _new_table public.seating_tables;
  _config public.seating_config;
begin
  select lower(u.email), s.role into _email, _role
  from auth.users u join public.rovty_staff s on s.email = lower(u.email)
  where u.id = _actor and u.email_confirmed_at is not null;
  if _role is null then raise exception using errcode = '42501', message = 'Rovty team access required.'; end if;
  if _action = 'access' then return jsonb_build_object('email', _email, 'role', _role); end if;
  if jsonb_typeof(_params) is distinct from 'object' then raise exception 'Invalid parameters.'; end if;
  _page := greatest(0, least(coalesce((_params->>'page')::int, 0), 100000));
  _q := left(trim(coalesce(_params->>'query', '')), 100);
  -- LIKE wildcards are literal search characters, never query syntax.
  _q := '%' || replace(replace(replace(lower(_q), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';

  if _action = 'list' then
    _filter := coalesce(_params->>'filter', 'all');
    if _filter not in ('all', 'published', 'draft', 'upcoming', 'past') then raise exception 'Invalid filter.'; end if;
    select jsonb_build_object('total', count(*), 'published', count(*) filter(where published),
      'draft', count(*) filter(where not published), 'upcoming', count(*) filter(where event_date >= now()))
      into _summary from public.weddings;
    with matches as materialized (
      select w.id, w.slug, w.bride, w.groom, w.event_date, w.venue, w.template, w.published, w.updated_at, u.email as owner_email
      from public.weddings w left join auth.users u on u.id = w.owner_id
      where lower(concat_ws(' ', w.bride, w.groom, w.slug, w.venue, u.email)) like _q
      and (_filter = 'all' or (_filter = 'published' and w.published) or (_filter = 'draft' and not w.published)
        or (_filter = 'upcoming' and w.event_date >= now()) or (_filter = 'past' and w.event_date < now()))
    ), page as (select * from matches order by event_date desc, id limit 25 offset _page * 25)
    select (select count(*) from matches), coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('metrics', public.rovty_wedding_metrics(p.id)) order by p.event_date desc, p.id), '[]')
      into _total, _items from page p;
    return jsonb_build_object('summary', _summary, 'total', _total, 'page', _page, 'items', _items);
  end if;

  _id := (_params->>'weddingId')::uuid;
  select * into _w from public.weddings where id = _id;
  if not found then raise exception using errcode = 'P0002', message = 'Wedding not found.'; end if;

  if _action = 'detail' then
    return jsonb_build_object('wedding', to_jsonb(_w), 'metrics', public.rovty_wedding_metrics(_id),
      'owner', (select jsonb_build_object('id', u.id, 'email', u.email, 'last_sign_in_at', u.last_sign_in_at, 'created_at', u.created_at) from auth.users u where u.id = _w.owner_id),
      'team', (select coalesce(jsonb_agg(to_jsonb(m) order by m.created_at), '[]') from public.wedding_members m where m.wedding_id = _id),
      'tables', (select coalesce(jsonb_agg(to_jsonb(t) order by t.table_number), '[]') from public.seating_tables t where t.wedding_id = _id),
      'seating', (select to_jsonb(c) from public.seating_config c where c.wedding_id = _id),
      'audit', (select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc), '[]') from
        (select * from public.wedding_admin_audit where wedding_id = _id order by created_at desc limit 30) a));
  end if;

  if _action = 'guests' then
    with matches as materialized (
      select g.*, r.attending, r.message as rsvp_message, r.updated_at as replied_at,
        t.table_number, t.table_name, t.id as table_id
      from public.guests g
      left join public.rsvps r on r.wedding_id = g.wedding_id and r.guest_code = g.code
      left join public.seating_assignments a on a.wedding_id = g.wedding_id and a.guest_code = g.code
      left join public.seating_tables t on t.id = a.table_id and t.wedding_id = _id
      where g.wedding_id = _id and lower(concat_ws(' ', g.name, g.phone, g.code)) like _q
    ), page as (select * from matches order by name, id limit 50 offset _page * 50)
    select (select count(*) from matches), coalesce(jsonb_agg(to_jsonb(p) order by p.name, p.id), '[]') into _total, _items from page p;
    return jsonb_build_object('total', _total, 'page', _page, 'items', _items);
  end if;

  if _role <> 'admin' then raise exception using errcode = '42501', message = 'Editing requires Rovty admin access.'; end if;
  _reason := trim(coalesce(_params->>'reason', ''));
  if length(_reason) < 5 or length(_reason) > 1000 then raise exception 'Add a reason between 5 and 1000 characters.'; end if;
  _patch := _params->'changes';

  -- Serialize staff updates to a wedding. The audit and edit commit together.
  select * into _w from public.weddings where id = _id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Wedding not found.'; end if;
  if _action = 'wedding' then
    if jsonb_typeof(_patch) is distinct from 'object' or _patch = '{}' then raise exception 'No changes supplied.'; end if;
    if exists (select 1 from jsonb_object_keys(_patch) k where k not in
      ('slug','bride','groom','groom_parents_names','bride_parents_names','event_date','event_end','reception_date','reception_end',
       'venue','hall','address','description','invite_message_before','invite_message_after','seating_message_before','seating_message_after',
       'template','couple_photo_url','venue_photo_url','share_image_url','maps_url','music_url','floor_plan_url','published')) then raise exception 'That field cannot be changed here.'; end if;
    if _w.updated_at is distinct from (_params->>'version')::timestamptz then raise exception using errcode = '40001', message = 'This wedding changed. Reload before saving.'; end if;
    _new := jsonb_populate_record(_w, _patch);
    if length(trim(_new.bride)) not between 1 and 80 or length(trim(_new.groom)) not between 1 and 80
       or _new.bride is null or _new.groom is null then raise exception 'Enter both couple names (up to 80 characters).'; end if;
    if _new.slug is null or _new.slug in ('admin','auth','api','templates','sso') then raise exception 'Choose another wedding username.'; end if;
    if _new.event_date is null or not isfinite(_new.event_date) or (_new.event_end is not null and _new.event_end < _new.event_date)
      or (_new.reception_end is not null and (_new.reception_date is null or _new.reception_end < _new.reception_date)) then raise exception 'Check the event dates and end times.'; end if;
    _before := to_jsonb(_w) - 'design';
    update public.weddings set slug=_new.slug, bride=trim(_new.bride), groom=trim(_new.groom),
      groom_parents_names=_new.groom_parents_names, bride_parents_names=_new.bride_parents_names,
      event_date=_new.event_date, event_end=_new.event_end, reception_date=_new.reception_date, reception_end=_new.reception_end,
      venue=_new.venue, hall=_new.hall, address=_new.address, description=_new.description,
      invite_message_before=_new.invite_message_before, invite_message_after=_new.invite_message_after,
      seating_message_before=_new.seating_message_before, seating_message_after=_new.seating_message_after,
      template=_new.template, couple_photo_url=_new.couple_photo_url, venue_photo_url=_new.venue_photo_url,
      share_image_url=_new.share_image_url, maps_url=_new.maps_url, music_url=_new.music_url, floor_plan_url=_new.floor_plan_url,
      published=_new.published, updated_at=clock_timestamp() where id=_id returning to_jsonb(weddings) - 'design' into _after;
  elsif _action = 'member' then
    if _params->>'role' not in ('admin','view','remove') or _params->>'role' is null then raise exception 'Choose a valid team role.'; end if;
    if nullif(_params->>'memberId','') is null then
      if _params->>'role' = 'remove' then raise exception 'Choose a team member.'; end if;
      select id into _member_user from auth.users where lower(email) = lower(trim(_params->>'email')) and email_confirmed_at is not null;
      if _member_user is null then raise exception 'That account must sign in to Rovty Wed before it can be added.'; end if;
      if _member_user = _w.owner_id then raise exception 'The owner already has full access.'; end if;
      -- The couple portal currently opens one wedding per account.
      perform 1 from auth.users where id = _member_user for update;
      if exists(select 1 from public.weddings where owner_id = _member_user and id <> _id)
        or exists(select 1 from public.wedding_members where user_id = _member_user and wedding_id <> _id)
        then raise exception 'This account already belongs to another wedding.'; end if;
      insert into public.wedding_members(wedding_id,user_id,email,role,invited_by)
        values(_id,_member_user,lower(trim(_params->>'email')),_params->>'role',_actor) returning to_jsonb(wedding_members) into _after;
    else
      select * into _member from public.wedding_members where id=(_params->>'memberId')::uuid and wedding_id=_id for update;
      if not found then raise exception using errcode='P0002', message='Team member not found.'; end if;
      if _member.role is distinct from _params->>'expectedRole' then raise exception using errcode='40001', message='This team role changed. Reload before saving.'; end if;
      _before := to_jsonb(_member);
      if _params->>'role' = 'remove' then delete from public.wedding_members where id=_member.id;
      else update public.wedding_members set role=_params->>'role' where id=_member.id returning to_jsonb(wedding_members) into _after; end if;
    end if;
  elsif _action = 'guest' then
    if jsonb_typeof(_patch) is distinct from 'object' or exists(select 1 from jsonb_object_keys(_patch) k where k not in ('name','phone','title','seats')) then raise exception 'Invalid guest changes.'; end if;
    select * into _guest from public.guests where id=(_params->>'guestId')::uuid and wedding_id=_id for update;
    if not found then raise exception using errcode='P0002', message='Guest not found.'; end if;
    if jsonb_build_object('name',_guest.name,'phone',_guest.phone,'title',_guest.title,'seats',_guest.seats) is distinct from _params->'expected' then raise exception using errcode='40001', message='This guest changed. Reload before saving.'; end if;
    _new_guest := jsonb_populate_record(_guest,_patch);
    if _new_guest.name is null or length(trim(_new_guest.name)) not between 1 and 160 or _new_guest.seats is null or _new_guest.seats not between 1 and 100 then raise exception 'Check the guest name and party size (1 to 100).'; end if;
    _before := to_jsonb(_guest);
    update public.guests set name=trim(_new_guest.name), phone=_new_guest.phone, title=_new_guest.title, seats=_new_guest.seats
      where id=_guest.id returning to_jsonb(guests) into _after;
  elsif _action = 'table' then
    if jsonb_typeof(_patch) is distinct from 'object' or exists(select 1 from jsonb_object_keys(_patch) k where k not in ('table_name','capacity','is_active')) then raise exception 'Invalid table changes.'; end if;
    select * into _table from public.seating_tables where id=(_params->>'tableId')::uuid and wedding_id=_id for update;
    if not found then raise exception using errcode='P0002', message='Table not found.'; end if;
    if _table.updated_at is distinct from (_params->>'version')::timestamptz then raise exception using errcode='40001', message='This table changed. Reload before saving.'; end if;
    _new_table := jsonb_populate_record(_table,_patch);
    if _new_table.capacity is null or _new_table.capacity not between 1 and 500 or _new_table.is_active is null then raise exception 'Check the capacity (1 to 500) and table status.'; end if;
    _before := to_jsonb(_table);
    update public.seating_tables set table_name=_new_table.table_name, capacity=_new_table.capacity, is_active=_new_table.is_active, updated_at=clock_timestamp()
      where id=_table.id returning to_jsonb(seating_tables) into _after;
  elsif _action = 'seating' then
    if jsonb_typeof(_params->'published') is distinct from 'boolean' then raise exception 'Choose a seating publication status.'; end if;
    select * into _config from public.seating_config where wedding_id=_id for update;
    if _config.updated_at is distinct from (_params->>'version')::timestamptz then raise exception using errcode='40001', message='Seating publication changed. Reload before saving.'; end if;
    _before := to_jsonb(_config);
    insert into public.seating_config(wedding_id,published,updated_at) values(_id,(_params->>'published')::boolean,clock_timestamp())
      on conflict(wedding_id) do update set published=excluded.published,updated_at=excluded.updated_at returning to_jsonb(seating_config) into _after;
  else raise exception 'Unknown management action.';
  end if;
  insert into public.wedding_admin_audit(wedding_id,actor_id,actor_email,action,reason,before_data,after_data)
    values(_id,_actor,_email,_action,_reason,_before,_after);
  return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.rovty_manage(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.rovty_manage(uuid,text,jsonb) to service_role;
commit;
