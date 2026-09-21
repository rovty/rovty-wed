-- Apply to Rovty Wed during the coordinated platform rollout. No wedding data moves.
begin;
create table public.platform_account_links (
  platform_user_id uuid primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  linked_at timestamptz not null default now()
);
create table public.platform_session_links (
  session_id uuid primary key references auth.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform_user_id uuid not null references public.platform_account_links(platform_user_id) on delete cascade,
  platform_session_id uuid not null,
  created_at timestamptz not null default now()
);
create table public.platform_gateway (
  id boolean primary key default true check(id),
  secret text not null default (gen_random_uuid()::text || gen_random_uuid()::text)
);
insert into public.platform_gateway(id) values(true);
alter table public.platform_account_links enable row level security;
alter table public.platform_session_links enable row level security;
alter table public.platform_gateway enable row level security;
revoke all on public.platform_account_links, public.platform_session_links, public.platform_gateway from public, anon, authenticated;
grant all on public.platform_account_links, public.platform_session_links, public.platform_gateway to service_role;

-- Email is used only for the first verified handoff. A linked account is always
-- resolved by its permanent platform UUID, including after an email change.
create function public.rovty_link_account(_platform_user uuid, _email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare _user uuid;
begin
  if _platform_user is null or nullif(trim(_email),'') is null then raise exception 'Invalid identity'; end if;
  perform pg_advisory_xact_lock(hashtextextended(_platform_user::text,0));
  select user_id into _user from public.platform_account_links where platform_user_id=_platform_user;
  if found then return _user; end if;
  select id into _user from auth.users where lower(email)=lower(trim(_email)) order by created_at limit 1 for update;
  if not found then return null; end if;
  if exists(select 1 from public.platform_account_links where user_id=_user and platform_user_id<>_platform_user) then
    raise exception using errcode='23505',message='This product account is already linked. Contact Rovty for an account review.';
  end if;
  insert into public.platform_account_links(platform_user_id,user_id) values(_platform_user,_user);
  return _user;
end;
$$;
create function public.rovty_bind_session(_user uuid, _session uuid, _platform_user uuid, _platform_session uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if _platform_session is null or not exists(select 1 from public.platform_account_links where platform_user_id=_platform_user and user_id=_user)
    or not exists(select 1 from auth.sessions where id=_session and user_id=_user) then raise exception 'Invalid session binding'; end if;
  -- A session can never be rebound to a different central login.
  insert into public.platform_session_links(session_id,user_id,platform_user_id,platform_session_id)
    values(_session,_user,_platform_user,_platform_session);
end;
$$;
create function public.rovty_platform_session(_user uuid, _session uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('user_id',l.platform_user_id,'session_id',l.platform_session_id)
  from public.platform_session_links l join auth.sessions s on s.id=l.session_id and s.user_id=l.user_id
  join public.platform_account_links a on a.platform_user_id=l.platform_user_id and a.user_id=l.user_id
  where l.user_id=_user and l.session_id=_session and (s.not_after is null or s.not_after>now());
$$;
create function public.rovty_gateway_secret()
returns text language sql stable security definer set search_path = '' as $$ select secret from public.platform_gateway where id=true $$;
revoke all on function public.rovty_link_account(uuid,text), public.rovty_bind_session(uuid,uuid,uuid,uuid), public.rovty_platform_session(uuid,uuid), public.rovty_gateway_secret() from public,anon,authenticated;
grant execute on function public.rovty_link_account(uuid,text), public.rovty_bind_session(uuid,uuid,uuid,uuid), public.rovty_platform_session(uuid,uuid), public.rovty_gateway_secret() to service_role;

-- The Worker supplies this private header only AFTER checking the central
-- session and product entitlement. It forwards the original user's JWT, so
-- existing wedding/team permissions still apply. Direct browser REST/storage
-- calls with a valid but revoked product JWT cannot bypass the Worker.
create function public.rovty_gateway_request()
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return coalesce((select secret = (nullif(current_setting('request.headers',true),'')::jsonb ->> 'x-rovty-gateway')
    from public.platform_gateway where id=true),false);
exception when others then return false;
end;
$$;
revoke all on function public.rovty_gateway_request() from public,anon;
grant execute on function public.rovty_gateway_request() to authenticated;
do $$ declare _table text; begin
  foreach _table in array array['weddings','guests','rsvps','wedding_members','seating_config','seating_tables','seating_assignments'] loop
    execute format('create policy "Rovty gateway required" on public.%I as restrictive for all to authenticated using ((select public.rovty_gateway_request())) with check ((select public.rovty_gateway_request()))',_table);
  end loop;
end $$;
-- Storage does not need to forward private HTTP headers into SQL. Direct
-- authenticated access is blocked; the Worker checks the wedding role with the
-- service-only function below before each narrowly scoped storage operation.
create policy "Rovty gateway required" on storage.objects as restrictive for all to authenticated
  using (false) with check (false);
create function public.rovty_media_access(_user uuid, _wedding uuid, _edit boolean default true)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.weddings where id=_wedding and owner_id=_user)
    or exists(select 1 from public.wedding_members where wedding_id=_wedding and user_id=_user and (not _edit or role='admin'));
$$;
revoke all on function public.rovty_media_access(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.rovty_media_access(uuid,uuid,boolean) to service_role;
commit;
