-- WED PROJECT ONLY. Central Rovty remains the billing authority.
begin;
create table public.billing_legacy_weddings(wedding_id uuid primary key references public.weddings(id) on delete cascade);
insert into public.billing_legacy_weddings select id from public.weddings;
alter table public.billing_legacy_weddings enable row level security;
revoke all on public.billing_legacy_weddings from public,anon,authenticated;
grant all on public.billing_legacy_weddings to service_role;
create function public.rovty_billing_weddings(_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'owner',a.platform_user_id,'legacy',l.wedding_id is not null)),'[]'::jsonb)
 from public.weddings w left join public.platform_account_links a on a.user_id=w.owner_id
 left join public.billing_legacy_weddings l on l.wedding_id=w.id
 where w.owner_id=_user or exists(select 1 from public.wedding_members m where m.wedding_id=w.id and m.user_id=_user);
$$;
revoke all on function public.rovty_billing_weddings(uuid) from public,anon,authenticated;
grant execute on function public.rovty_billing_weddings(uuid) to service_role;
create function public.rovty_plan_feature(_wedding uuid,_feature text) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare h jsonb; begin
 if not public.rovty_gateway_request() then return false; end if;
 h:=nullif(current_setting('request.headers',true),'')::jsonb;
 return coalesce(((h->>'x-rovty-plans')::jsonb -> _wedding::text -> 'features') ? _feature,false);
exception when others then return false;
end $$;
revoke all on function public.rovty_plan_feature(uuid,text) from public,anon;
grant execute on function public.rovty_plan_feature(uuid,text) to authenticated;
create function public.rovty_plan_wedding_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare h jsonb; features jsonb; begin
 -- Only explicit staff/server operations bypass plan checks, never a wedding's team role.
 if current_setting('role',true) in ('service_role','postgres','none','') then return new; end if;
 h:=nullif(current_setting('request.headers',true),'')::jsonb;
 if tg_op='INSERT' then
  features:=(h->>'x-rovty-owner-plan')::jsonb->'features';
  if not public.rovty_gateway_request() or not coalesce(features ? 'website',false) then raise exception 'Choose a Rovty Wed plan before creating a wedding.'; end if;
 else
  if not public.rovty_plan_feature(new.id,'website') then raise exception 'An active Rovty Wed plan is required.'; end if;
  features:=(h->>'x-rovty-plans')::jsonb->new.id::text->'features';
 end if;
 if not coalesce(features ? 'canvas',false) and jsonb_path_exists(coalesce(new.design,'{}'), '$.sections[*] ? (@.type == "canvas")')
 and (tg_op='INSERT' or jsonb_path_query_array(coalesce(new.design,'{}'),'$.sections[*] ? (@.type == "canvas")') is distinct from jsonb_path_query_array(coalesce(old.design,'{}'),'$.sections[*] ? (@.type == "canvas")'))
 then raise exception 'The custom design canvas is included in Studio. Your edits are still in the editor.'; end if;
 return new;
end $$;
create trigger billing_wedding_write before insert or update on public.weddings for each row execute function public.rovty_plan_wedding_write();
revoke all on function public.rovty_plan_wedding_write() from public,anon,authenticated;
-- Feature checks are in addition to the original wedding membership/edit RLS.
do $$ declare t text; begin
 foreach t in array array['seating_config','seating_tables','seating_assignments'] loop
  execute format('create policy "Seating plan required" on public.%I as restrictive for all to authenticated using (public.rovty_plan_feature(wedding_id,''seating'')) with check (public.rovty_plan_feature(wedding_id,''seating''))',t);
 end loop;
end $$;
create policy "Active wedding plan required" on public.weddings as restrictive for select to authenticated using (public.rovty_plan_feature(id,'website'));
do $$ declare t text; begin
 foreach t in array array['guests','rsvps','wedding_members'] loop
  execute format('create policy "Active wedding plan required" on public.%I as restrictive for all to authenticated using (public.rovty_plan_feature(wedding_id,''website'')) with check (public.rovty_plan_feature(wedding_id,''website''))',t);
 end loop;
end $$;
create function public.rovty_hosting_owner(_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('owner',a.platform_user_id,'legacy',l.wedding_id is not null)
 from public.weddings w left join public.platform_account_links a on a.user_id=w.owner_id
 left join public.billing_legacy_weddings l on l.wedding_id=w.id where w.slug=_slug and w.published;
$$;
revoke all on function public.rovty_hosting_owner(text) from public,anon,authenticated;
grant execute on function public.rovty_hosting_owner(text) to service_role;
commit;
