-- WED PROJECT ONLY. Let a paid owner receive their new wedding from
-- INSERT ... RETURNING before it exists in the gateway's wedding plan map.
begin;

create or replace function public.rovty_owner_plan_feature(_feature text)
returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare plan jsonb;
begin
  if not public.rovty_gateway_request() then return false; end if;
  plan := (nullif(current_setting('request.headers', true), '')::jsonb
    ->> 'x-rovty-owner-plan')::jsonb;
  return coalesce((plan ->> 'active')::boolean, false)
    and coalesce((plan -> 'features') ? _feature, false);
exception when others then return false;
end;
$$;
revoke all on function public.rovty_owner_plan_feature(text) from public, anon;
grant execute on function public.rovty_owner_plan_feature(text) to authenticated;

-- Check the new row's owner directly. A lookup of the row or its membership
-- cannot see a brand-new wedding within the same INSERT statement. The
-- signed-in owner's plan is already verified by the gateway for this request.
alter policy "Active wedding plan required" on public.weddings
using (
  public.rovty_plan_feature(id, 'website')
  or (
    owner_id = (select auth.uid())
    and public.rovty_owner_plan_feature('website')
  )
);

-- Original ownership/member RLS, write checks and identity locks still apply.
commit;
