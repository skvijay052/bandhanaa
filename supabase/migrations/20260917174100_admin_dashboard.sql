-- Additive admin console. Apply after the existing standalone schema scripts.
-- See docs/admin-architecture-assessment.md and docs/admin-setup.md.
begin;
create schema if not exists bandhanaa_private;
revoke all on schema bandhanaa_private from public, anon, authenticated;
grant usage on schema bandhanaa_private to authenticated;

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  role text not null check (role in ('super_admin','moderator','support_admin','finance_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index admin_users_active_role_idx on public.admin_users(role) where is_active;
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users(id) on delete restrict,
  action text not null,
  target_type text not null,
  -- Reports use bigint IDs, other entities use UUIDs. Do not force all IDs to UUID.
  target_id text not null,
  reason text not null check (char_length(reason) between 5 and 1000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit_logs(created_at desc, id);
create index admin_audit_target_idx on public.admin_audit_logs(target_type,target_id,created_at desc);
alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from public, anon, authenticated, service_role;

alter table public.profiles
  add column account_status text not null default 'active' check(account_status in ('active','suspended','disabled')),
  add column review_status text not null default 'not_submitted' check(review_status in ('not_submitted','pending','verified','rejected')),
  add column review_submitted_at timestamptz,
  add column reviewed_at timestamptz;
revoke update on public.profiles from authenticated, anon;
-- REVOKE table UPDATE also removes column UPDATE privileges: explicitly preserve
-- the exact editable fields inspected in the existing production grants.
grant update(email,display_name,avatar_url,gender,age,birth_date,weight,profession,
  company,city,state,country,religion,education,height,mother_tongue,marital_status,
  bio,photos,lifestyle,family,partner_preferences,horoscope,visibility_details,
  profile_visibility,profile_completion,compatibility,last_seen_at,updated_at,annual_income)
  on public.profiles to authenticated;
-- This is an operations queue, not identity-document verification. Email status remains untouched.
update public.profiles set review_status='pending', review_submitted_at=now()
where onboarding_completed and registration_status='active';
create index profiles_admin_created_idx on public.profiles(created_at desc,id);
create index profiles_admin_review_idx on public.profiles(review_status,review_submitted_at,id);
create index profiles_admin_status_idx on public.profiles(account_status,created_at desc);

create table bandhanaa_private.admin_report_details (
  report_id bigint primary key references public.member_reports(id) on delete cascade,
  assigned_admin_id uuid references public.admin_users(id),
  resolution_note text check(char_length(resolution_note)<=1000),
  resolved_at timestamptz, updated_at timestamptz not null default now()
);
alter table bandhanaa_private.admin_report_details enable row level security;
revoke all on bandhanaa_private.admin_report_details from public, anon, authenticated;
create index member_reports_admin_queue_idx on public.member_reports(status,created_at desc,id);
-- Members can submit only the input fields, never forge a resolved status or timestamp.
revoke insert on public.member_reports from authenticated;
grant insert(reporter_id,reported_id,reason,details) on public.member_reports to authenticated;

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subject text not null check(char_length(subject) between 1 and 150 and subject !~ E'[\\r\\n]'),
  body text not null check(char_length(body) between 10 and 5000),
  status text not null default 'open' check(status in ('open','in_review','resolved')),
  email_delivery_status text not null default 'pending' check(email_delivery_status in ('pending','sent','failed')),
  assigned_admin_id uuid references public.admin_users(id),
  internal_note text check(char_length(internal_note)<=1000),
  resolved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index support_requests_queue_idx on public.support_requests(status,created_at desc,id);
create index support_requests_user_idx on public.support_requests(user_id,created_at desc);
alter table public.support_requests enable row level security;
revoke all on public.support_requests from public,anon,authenticated;
grant select on public.support_requests to service_role;
grant update(email_delivery_status) on public.support_requests to service_role;

alter table public.message_credit_transactions add column admin_request_id uuid, add column balance_after integer check(balance_after>=0);
alter table public.message_credit_transactions drop constraint message_credit_transactions_transaction_type_check;
alter table public.message_credit_transactions drop constraint message_credit_transactions_shape_check;
alter table public.message_credit_transactions add constraint message_credit_transactions_transaction_type_check
  check(transaction_type in ('referral_reward','message_spend','payment_purchase','admin_adjustment'));
alter table public.message_credit_transactions add constraint message_credit_transactions_shape_check check(
  (transaction_type='referral_reward' and amount=10 and message_id is null and purchase_id is null and admin_request_id is null)
  or (transaction_type='message_spend' and amount=-1 and referral_id is null and purchase_id is null and admin_request_id is null)
  or (transaction_type='payment_purchase' and amount=10 and referral_id is null and message_id is null and purchase_id is not null and admin_request_id is null)
  or (transaction_type='admin_adjustment' and amount<>0 and abs(amount::bigint)<=10000 and referral_id is null and message_id is null and purchase_id is null and admin_request_id is not null)
);
create unique index message_credit_admin_request_idx on public.message_credit_transactions(admin_request_id) where admin_request_id is not null;

-- Preserve the AFTER INSERT timing: ON CONFLICT DO NOTHING must never affect wallets.
create or replace function public.apply_message_credit_transaction()
returns trigger language plpgsql security definer set search_path='' as $$
declare resulting_balance integer;
begin
  insert into public.message_credit_wallets(user_id) values(new.user_id) on conflict do nothing;
  perform 1 from public.message_credit_wallets where user_id=new.user_id for update;
  update public.message_credit_wallets set available_credits=available_credits+new.amount,updated_at=now()
    where user_id=new.user_id and available_credits::bigint+new.amount between 0 and 2147483647
    returning available_credits into resulting_balance;
  if not found then raise exception 'Insufficient message credits' using errcode='P0001'; end if;
  update public.message_credit_transactions set balance_after=resulting_balance where id=new.id;
  return new;
end $$;
revoke all on function public.apply_message_credit_transaction() from public,anon,authenticated;

create function bandhanaa_private.member_enabled(candidate uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select candidate is not null and not exists(select 1 from public.profiles where id=candidate and account_status<>'active');
$$;
revoke all on function bandhanaa_private.member_enabled(uuid) from public,anon,authenticated;
grant execute on function bandhanaa_private.member_enabled(uuid) to authenticated;

create function bandhanaa_private.require_admin(permission text default 'identity')
returns public.admin_users language plpgsql security definer set search_path='' as $$
declare actor public.admin_users; sid text := nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id';
begin
  if auth.uid() is null or sid is null or not exists(
    select 1 from auth.sessions s join auth.users u on u.id=s.user_id
    where s.id::text=sid and s.user_id=auth.uid() and u.email_confirmed_at is not null
      and (s.not_after is null or s.not_after>now())
  ) or not bandhanaa_private.member_enabled(auth.uid()) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  -- Role mutation uses an exclusive lock on this same row. No stale JWT role claims.
  select * into actor from public.admin_users where user_id=auth.uid() and is_active for share;
  if not found then raise exception 'Administrator access required' using errcode='42501'; end if;
  if permission not in ('identity','overview','users','verification','reports','connections','referrals','chat-credits','payments','support','audit','settings','admins','suspend','restore','approve','reject','report','adjust','admin') then
    raise exception 'Unknown permission' using errcode='42501';
  end if;
  if actor.role='super_admin' or permission='identity'
    or (actor.role='moderator' and permission in ('users','verification','reports','connections','suspend','restore','approve','reject','report'))
    or (actor.role='support_admin' and permission in ('users','support'))
    or (actor.role='finance_admin' and permission in ('chat-credits','payments','adjust')) then return actor; end if;
  raise exception 'Permission denied' using errcode='42501';
end $$;
revoke all on function bandhanaa_private.require_admin(text) from public,anon,authenticated;

create function bandhanaa_private.identity()
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor public.admin_users := bandhanaa_private.require_admin(); result jsonb;
begin
  select jsonb_build_object('id',actor.id,'user_id',actor.user_id,'role',actor.role,
    'name',coalesce(p.display_name,'Administrator'),'email',u.email) into result
  from auth.users u left join public.profiles p on p.id=u.id where u.id=actor.user_id;
  return result;
end $$;
revoke all on function bandhanaa_private.identity() from public,anon,authenticated;
grant execute on function bandhanaa_private.identity() to authenticated;
create function public.admin_identity() returns jsonb language sql security invoker set search_path='' as $$select bandhanaa_private.identity()$$;
revoke all on function public.admin_identity() from public,anon,authenticated;
grant execute on function public.admin_identity() to authenticated;

-- Protected profile fields are never part of member UPDATE column grants.
create function bandhanaa_private.queue_profile_review()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.onboarding_completed and new.registration_status='active' and new.review_status='not_submitted' then
    new.review_status := 'pending'; new.review_submitted_at := now();
  end if;
  return new;
end $$;
revoke all on function bandhanaa_private.queue_profile_review() from public,anon,authenticated;
create trigger admin_queue_profile_review before insert or update of onboarding_completed,registration_status on public.profiles
for each row execute function bandhanaa_private.queue_profile_review();

-- Security-definer registration RPCs also hit this trigger: activation cannot undo suspension.
create function bandhanaa_private.guard_member_write()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is not null and not bandhanaa_private.member_enabled(auth.uid()) then
    raise exception 'Account is unavailable' using errcode='42501';
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
revoke all on function bandhanaa_private.guard_member_write() from public,anon,authenticated;
do $$ declare t text; begin
  foreach t in array array['profiles','profile_likes','messages','profile_shortlists','blocked_users','user_privacy_settings','member_reports','referral_codes','referrals','user_activity'] loop
    execute format('create trigger admin_guard_member_write before insert or update or delete on public.%I for each row execute function bandhanaa_private.guard_member_write()',t);
    if t<>'profiles' then
      execute format('create policy admin_suspension_guard on public.%I as restrictive for all to authenticated using ((select bandhanaa_private.member_enabled(auth.uid()))) with check ((select bandhanaa_private.member_enabled(auth.uid())))',t);
    end if;
  end loop;
end $$;
create policy admin_suspension_read on public.profiles as restrictive for select to authenticated
using (id=(select auth.uid()) or ((select bandhanaa_private.member_enabled(auth.uid())) and account_status='active'));
create policy admin_suspension_update on public.profiles as restrictive for update to authenticated
using ((select bandhanaa_private.member_enabled(auth.uid()))) with check ((select bandhanaa_private.member_enabled(auth.uid())));
create policy admin_suspension_storage_insert on storage.objects as restrictive for insert to authenticated with check ((select bandhanaa_private.member_enabled(auth.uid())));
create policy admin_suspension_storage_update on storage.objects as restrictive for update to authenticated using ((select bandhanaa_private.member_enabled(auth.uid()))) with check ((select bandhanaa_private.member_enabled(auth.uid())));
create policy admin_suspension_storage_delete on storage.objects as restrictive for delete to authenticated using ((select bandhanaa_private.member_enabled(auth.uid())));

create or replace function public.is_active_profile(profile_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join auth.users u on u.id=p.id where p.id=profile_id
    and p.registration_status='active' and p.is_verified and p.onboarding_completed
    and p.account_status='active' and u.email_confirmed_at is not null);
$$;
create or replace function public.can_view_profile(viewer_id uuid,subject_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select viewer_id=subject_id or (bandhanaa_private.member_enabled(viewer_id) and exists(
    select 1 from public.profiles p left join public.user_privacy_settings s on s.user_id=p.id
    where p.id=subject_id and p.account_status='active'
      and p.registration_status='active' and p.is_verified and p.onboarding_completed and p.is_discoverable
      and not exists(select 1 from public.blocked_users b where (b.blocker_id=viewer_id and b.blocked_id=subject_id) or (b.blocker_id=subject_id and b.blocked_id=viewer_id))
      and (coalesce(s.profile_visibility,'everyone')='everyone' or (coalesce(s.profile_visibility,'everyone')='matches' and public.are_profiles_matched(viewer_id,subject_id)))
  ));
$$;

create function bandhanaa_private.append_audit(actor uuid, event text, kind text, target text, why text, details jsonb default '{}')
returns void language sql security definer set search_path='' as $$
  insert into public.admin_audit_logs(admin_user_id,action,target_type,target_id,reason,metadata) values(actor,event,kind,target,why,details);
$$;
revoke all on function bandhanaa_private.append_audit(uuid,text,text,text,text,jsonb) from public,anon,authenticated;
create function bandhanaa_private.audit_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Audit records are append-only' using errcode='42501'; end $$;
revoke all on function bandhanaa_private.audit_immutable() from public,anon,authenticated;
create trigger admin_audit_immutable before update or delete on public.admin_audit_logs for each row execute function bandhanaa_private.audit_immutable();

create function bandhanaa_private.mutate(p_action text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor public.admin_users; target uuid; why text:=trim(p_payload->>'reason');
  previous text; next_status text; event text; kind text; report_id bigint; adjustment integer; request_id uuid;
  transaction_row public.message_credit_transactions; role_record public.admin_users; result_id uuid;
begin
  -- Serialize role changes before taking membership row locks to avoid lock-order inversions.
  if p_action='admin' then perform pg_advisory_xact_lock(731920,1); end if;
  actor:=bandhanaa_private.require_admin(p_action);
  if p_action not in ('suspend','restore','approve','reject','report','adjust','support','admin')
    or why is null or char_length(why) not between 5 and 1000 then raise exception 'Invalid request' using errcode='22023'; end if;
  if p_action='report' then report_id:=(p_payload->>'target')::bigint;
  else target:=(p_payload->>'target')::uuid; end if;
  if p_action in ('suspend','restore','approve','reject') then
    select case when p_action in ('suspend','restore') then account_status else review_status end into previous
    from public.profiles where id=target for update;
    if not found then raise exception 'Member not found' using errcode='P0002'; end if;
    if p_action in ('suspend','restore') then
      if target=actor.user_id or exists(select 1 from public.admin_users where user_id=target and is_active) then
        raise exception 'Active administrators cannot be moderated here' using errcode='42501'; end if;
      if (p_action='suspend' and previous<>'active') or (p_action='restore' and previous<>'suspended') then
        raise exception 'Account state changed' using errcode='40001'; end if;
      next_status:=case when p_action='suspend' then 'suspended' else 'active' end;
      update public.profiles set account_status=next_status where id=target;
      event:=case when p_action='suspend' then 'user_suspended' else 'user_restored' end;
    else
      if previous='not_submitted' or previous is distinct from p_payload->>'expected' then raise exception 'Review state changed' using errcode='40001'; end if;
      next_status:=case when p_action='approve' then 'verified' else 'rejected' end;
      if previous=next_status then raise exception 'Review state changed' using errcode='40001'; end if;
      update public.profiles set review_status=next_status,reviewed_at=now() where id=target;
      event:=case when p_action='approve' then 'profile_verified' else 'profile_verification_rejected' end;
    end if;
    kind:='member';
  elsif p_action='report' then
    next_status:=p_payload->>'status';
    if next_status is null or next_status not in ('reviewing','resolved','dismissed') then raise exception 'Invalid report status' using errcode='22023'; end if;
    select status into previous from public.member_reports where id=report_id for update;
    if not found then raise exception 'Report not found' using errcode='P0002'; end if;
    if previous is distinct from p_payload->>'expected' or previous in ('resolved','dismissed') then raise exception 'Report state changed' using errcode='40001'; end if;
    update public.member_reports set status=next_status where id=report_id;
    insert into bandhanaa_private.admin_report_details(report_id,assigned_admin_id,resolution_note,resolved_at)
      values(report_id,actor.id,why,case when next_status in ('resolved','dismissed') then now() end)
      on conflict on constraint admin_report_details_pkey do update set assigned_admin_id=excluded.assigned_admin_id,resolution_note=excluded.resolution_note,resolved_at=excluded.resolved_at,updated_at=now();
    event:=case next_status when 'reviewing' then 'report_in_review' when 'resolved' then 'report_resolved' else 'report_dismissed' end;kind:='report';
  elsif p_action='adjust' then
    adjustment:=(p_payload->>'amount')::integer; request_id:=(p_payload->>'request_id')::uuid;
    if adjustment is null or adjustment=0 or abs(adjustment::bigint)>10000 or request_id is null then raise exception 'Invalid adjustment' using errcode='22023'; end if;
    if not exists(select 1 from public.profiles where id=target) then raise exception 'Member not found' using errcode='P0002'; end if;
    perform pg_advisory_xact_lock(hashtextextended('admin-credit:'||request_id::text,0));
    select * into transaction_row from public.message_credit_transactions where admin_request_id=request_id;
    if found then
      if transaction_row.user_id<>target or transaction_row.amount<>adjustment
        or not exists(select 1 from public.admin_audit_logs where target_id=transaction_row.id::text and admin_user_id=actor.id and reason=why) then
        raise exception 'Request ID already used' using errcode='23505'; end if;
      return jsonb_build_object('ok',true,'replayed',true);
    end if;
    -- Existing AFTER INSERT trigger locks the wallet and enforces nonnegative balance.
    insert into public.message_credit_transactions(user_id,amount,transaction_type,description,admin_request_id)
      values(target,adjustment,'admin_adjustment','Administrator adjustment',request_id) returning id into result_id;
    perform bandhanaa_private.append_audit(actor.id,case when adjustment>0 then 'credits_added' else 'credits_removed' end,
      'credit_transaction',result_id::text,why,jsonb_build_object('member_id',target,'amount',adjustment,'request_id',request_id));
    return jsonb_build_object('ok',true);
  elsif p_action='support' then
    next_status:=p_payload->>'status';
    if next_status is null or next_status not in ('in_review','resolved') then raise exception 'Invalid support status' using errcode='22023'; end if;
    select status into previous from public.support_requests where id=target for update;
    if not found then raise exception 'Support request not found' using errcode='P0002'; end if;
    if previous is distinct from p_payload->>'expected' or previous='resolved' then raise exception 'Support state changed' using errcode='40001'; end if;
    update public.support_requests set status=next_status,assigned_admin_id=actor.id,internal_note=why,
      resolved_at=case when next_status='resolved' then now() end,updated_at=now() where id=target;
    event:='support_'||next_status;kind:='support_request';
  else
    next_status:=p_payload->>'role';
    if next_status is null or next_status not in ('super_admin','moderator','support_admin','finance_admin') or jsonb_typeof(p_payload->'active') is distinct from 'boolean' then
      raise exception 'Invalid administrator role' using errcode='22023'; end if;
    if target=actor.user_id then raise exception 'Cannot change your own administrator access' using errcode='42501'; end if;
    if not exists(select 1 from auth.users where id=target and email_confirmed_at is not null)
      or not bandhanaa_private.member_enabled(target) then raise exception 'An existing confirmed enabled account is required' using errcode='P0001'; end if;
    select * into role_record from public.admin_users where user_id=target for update;
    previous:=role_record.role;
    if role_record.role='super_admin' and role_record.is_active
      and (next_status<>'super_admin' or not (p_payload->>'active')::boolean)
      and not exists(select 1 from public.admin_users where role='super_admin' and is_active and user_id<>target) then
      raise exception 'An active super admin must remain' using errcode='P0001'; end if;
    insert into public.admin_users(user_id,role,is_active) values(target,next_status,(p_payload->>'active')::boolean)
      on conflict(user_id) do update set role=excluded.role,is_active=excluded.is_active,updated_at=now();
    event:=case when previous is null then 'admin_created' when not (p_payload->>'active')::boolean then 'admin_disabled' when previous<>next_status then 'admin_role_changed' else 'admin_enabled' end;
    kind:='admin';
  end if;
  perform bandhanaa_private.append_audit(actor.id,event,kind,coalesce(target::text,report_id::text),why,
    jsonb_build_object('previous',previous,'next',next_status));
  return jsonb_build_object('ok',true);
end $$;
revoke all on function bandhanaa_private.mutate(text,jsonb) from public,anon,authenticated;
grant execute on function bandhanaa_private.mutate(text,jsonb) to authenticated;
create function public.admin_mutate(p_action text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select bandhanaa_private.mutate(p_action,p_payload)$$;
revoke all on function public.admin_mutate(text,jsonb) from public,anon,authenticated;
grant execute on function public.admin_mutate(text,jsonb) to authenticated;

create function bandhanaa_private.submit_support(p_subject text,p_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_subject is null or p_body is null or char_length(trim(p_subject)) not between 1 and 150 or char_length(trim(p_body)) not between 10 and 5000 then raise exception 'Invalid request' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('support:'||auth.uid()::text,0));
  -- Retries of the same form do not create duplicate inbox entries.
  select id into result from public.support_requests where user_id=auth.uid() and subject=trim(p_subject) and body=trim(p_body) and created_at>now()-interval '5 minutes' order by created_at desc limit 1;
  if found then return result; end if;
  if (select count(*) from public.support_requests where user_id=auth.uid() and created_at>now()-interval '1 day')>=20
    or (select count(*) from public.support_requests where user_id=auth.uid() and created_at>now()-interval '1 minute')>=3 then
    raise exception 'Please wait before submitting another request' using errcode='P0001'; end if;
  insert into public.support_requests(user_id,subject,body) values(auth.uid(),trim(p_subject),trim(p_body)) returning id into result;
  return result;
end $$;
revoke all on function bandhanaa_private.submit_support(text,text) from public,anon,authenticated;
grant execute on function bandhanaa_private.submit_support(text,text) to authenticated;
create function public.submit_support_request(p_subject text,p_body text) returns uuid language sql security invoker set search_path='' as $$select bandhanaa_private.submit_support(p_subject,p_body)$$;
revoke all on function public.submit_support_request(text,text) from public,anon,authenticated;
grant execute on function public.submit_support_request(text,text) to authenticated;


create function bandhanaa_private.read(p_section text,p_filters jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor public.admin_users:=bandhanaa_private.require_admin(p_section);
  page_number integer:=coalesce((p_filters->>'page')::integer,1); page_size integer:=25;
  search text:=coalesce(trim(p_filters->>'q'),''); pattern text;
  status_filter text:=coalesce(p_filters->>'status',''); verification text:=coalesce(p_filters->>'verification','');
  gender_filter text:=coalesce(p_filters->>'gender',''); reason_filter text:=coalesce(p_filters->>'reason','');
  start_at timestamptz:=nullif(p_filters->>'from','')::date::timestamp at time zone 'UTC';
  end_at timestamptz:=(nullif(p_filters->>'to','')::date+1)::timestamp at time zone 'UTC';
  member_id uuid:=nullif(p_filters->>'id','')::uuid; detail_id text:=p_filters->>'detail_id';
  tab_name text:=coalesce(p_filters->>'tab','overview');
  items jsonb:='[]'; item_count bigint:=0; result jsonb:='{}'; member jsonb; metrics jsonb; chart jsonb;
  trend_days integer:=coalesce((p_filters->>'trend')::integer,30);
begin
  if page_number not between 1 and 100000 or char_length(search)>100
    or (start_at is not null and end_at is not null and start_at>=end_at)
    or trend_days not in (7,30,90) then raise exception 'Invalid filters' using errcode='22023'; end if;
  if actor.role='support_admin' and gender_filter<>'' then raise exception 'Permission denied' using errcode='42501'; end if;
  pattern:='%'||replace(replace(replace(search,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%';
  if p_section='users' and detail_id is not null then
    select jsonb_build_object('id',p.id,'name',p.display_name,'email',au.email,'avatar_url',p.avatar_url,
      'joined',p.created_at,'last_active',p.last_seen_at,'profile_completion',p.profile_completion,
      'email_verified',p.is_verified,'registration',p.registration_status,'onboarding_completed',p.onboarding_completed,
      'status',p.account_status,'verification',p.review_status,'submitted',p.review_submitted_at,'reviewed',p.reviewed_at)
      || case when actor.role in ('super_admin','moderator') then jsonb_build_object('age',p.age,'gender',p.gender,'location',concat_ws(', ',p.city,p.state,p.country),
        'profession',p.profession,'education',p.education,'religion',p.religion,'mother_tongue',p.mother_tongue,'marital_status',p.marital_status,'bio',p.bio)
        else '{}'::jsonb end into member from public.profiles p join auth.users au on au.id=p.id where p.id=detail_id::uuid;
    if member is null then return jsonb_build_object('rows','[]'::jsonb,'total',0,'page',1,'page_size',25); end if;
    if tab_name in ('overview','profile') then
      if tab_name='profile' and actor.role='support_admin' then raise exception 'Permission denied' using errcode='42501'; end if;
      result:=jsonb_build_object('rows','[]'::jsonb,'total',0,'page',1,'page_size',25);
    elsif tab_name in ('connections','credits','payments','reports','activity') then
      if tab_name='activity' then
        if actor.role not in ('super_admin','moderator') then raise exception 'Permission denied' using errcode='42501'; end if;
        select count(*) into item_count from public.user_activity where user_id=detail_id::uuid;
        select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
          select id,activity_type as type,created_at as date,target_user_id::text as reference
          from public.user_activity where user_id=detail_id::uuid order by created_at desc,id desc limit page_size offset (page_number-1)*page_size
        ) r;
        result:=jsonb_build_object('rows',items,'total',item_count,'page',page_number,'page_size',page_size);
      else
        result:=bandhanaa_private.read(case when tab_name='credits' then 'chat-credits' else tab_name end,
          (p_filters-'detail_id')||jsonb_build_object('id',detail_id));
      end if;
    else raise exception 'Invalid tab' using errcode='22023'; end if;
    if tab_name='credits' then member:=member||jsonb_build_object('balance',result->'member'->'balance'); end if;
    return result||jsonb_build_object('member',member);
  end if;

  if p_section='overview' then
    if coalesce(p_filters->>'range','30')<>'custom' then
      end_at:=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'+interval '1 day';
      start_at:=end_at-case coalesce(p_filters->>'range','30') when 'today' then interval '1 day' when '7' then interval '7 days' else interval '30 days' end;
    end if;
    if start_at is null or end_at is null or end_at-start_at>interval '366 days' then raise exception 'Choose a date range up to 366 days' using errcode='22023'; end if;
    select jsonb_build_object(
      'total_members',(select count(*) from public.profiles),
      'new_registrations',(select count(*) from public.profiles where created_at>=start_at and created_at<end_at),
      'active_members',(select count(*) from public.profiles where account_status='active' and last_seen_at>=start_at and last_seen_at<end_at),
      'pending_verification',(select count(*) from public.profiles where review_status='pending'),
      'open_reports',(select count(*) from public.member_reports where status in ('submitted','reviewing')),
      'credits_purchased',(select coalesce(sum(credits),0) from public.message_credit_purchases where status='paid' and paid_at>=start_at and paid_at<end_at),
      'failed_payments',(select count(*) from public.message_credit_purchases where status='failed'),
      'unresolved_support',(select count(*) from public.support_requests where status<>'resolved')
    ) into metrics;
    select coalesce(jsonb_agg(to_jsonb(t) order by t.date),'[]') into chart from (
      select d::date::text as date,count(p.id)::integer as count
      -- Explicit timestamp overload: session time zones must not shift UTC day buckets.
      from generate_series(((now() at time zone 'UTC')::date-(trend_days-1))::timestamp,
        ((now() at time zone 'UTC')::date)::timestamp,interval '1 day') d
      left join public.profiles p on p.created_at>=d at time zone 'UTC' and p.created_at<(d+interval '1 day') at time zone 'UTC'
      group by d
    ) t;
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select p.id,p.display_name as name,u.email,p.avatar_url,p.city as location,p.created_at as joined,p.review_status as verification,p.account_status as status
      from public.profiles p join auth.users u on u.id=p.id order by p.created_at desc,p.id desc limit 8
    ) r;
    return jsonb_build_object('rows',items,'total',jsonb_array_length(items),'page',1,'page_size',8,'metrics',metrics,'trend',chart);
  elsif p_section in ('users','verification') then
    select count(*) into item_count from public.profiles p join auth.users au on au.id=p.id where (search='' or p.display_name ilike pattern or au.email ilike pattern or p.id::text=search)
      and (status_filter='' or case when p_section='verification' then p.review_status else p.account_status end=status_filter)
      and (verification='' or p.review_status=verification) and (gender_filter='' or lower(p.gender)=gender_filter)
      and (start_at is null or p.created_at>=start_at) and (end_at is null or p.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select p.id,p.display_name as name,au.email,p.avatar_url,p.created_at as joined,p.last_seen_at as last_active,
        p.review_status as verification,p.account_status as status,p.review_submitted_at as submitted,p.profile_completion as completion,
        case when actor.role<>'support_admin' then p.age end as age,
        case when actor.role<>'support_admin' then p.gender end as gender,
        case when actor.role<>'support_admin' then concat_ws(', ',p.city,p.state) end as location from public.profiles p join auth.users au on au.id=p.id where (search='' or p.display_name ilike pattern or au.email ilike pattern or p.id::text=search)
      and (status_filter='' or case when p_section='verification' then p.review_status else p.account_status end=status_filter)
      and (verification='' or p.review_status=verification) and (gender_filter='' or lower(p.gender)=gender_filter)
      and (start_at is null or p.created_at>=start_at) and (end_at is null or p.created_at<end_at) order by p.created_at desc,p.id desc limit page_size offset (page_number-1)*page_size
    ) r;

  elsif p_section='connections' then
    select count(*) into item_count from public.profile_likes l left join public.profiles a on a.id=l.liker_id left join public.profiles b on b.id=l.liked_id left join auth.users autha on autha.id=l.liker_id left join auth.users authb on authb.id=l.liked_id where (status_filter='' or l.status=status_filter) and (member_id is null or l.liker_id=member_id or l.liked_id=member_id) and (search='' or a.display_name ilike pattern or b.display_name ilike pattern or autha.email ilike pattern or authb.email ilike pattern) and (start_at is null or l.created_at>=start_at) and (end_at is null or l.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select l.liker_id::text||':'||l.liked_id::text as id,a.display_name as from_member,a.id as from_id,b.display_name as to_member,b.id as to_id,l.status,l.created_at as date,l.responded_at as responded from public.profile_likes l left join public.profiles a on a.id=l.liker_id left join public.profiles b on b.id=l.liked_id left join auth.users autha on autha.id=l.liker_id left join auth.users authb on authb.id=l.liked_id where (status_filter='' or l.status=status_filter) and (member_id is null or l.liker_id=member_id or l.liked_id=member_id) and (search='' or a.display_name ilike pattern or b.display_name ilike pattern or autha.email ilike pattern or authb.email ilike pattern) and (start_at is null or l.created_at>=start_at) and (end_at is null or l.created_at<end_at) order by l.created_at desc,l.liker_id,l.liked_id limit page_size offset (page_number-1)*page_size
    ) r;

  elsif p_section='reports' then
    select count(*) into item_count from public.member_reports r left join public.profiles p on p.id=r.reported_id left join public.profiles reporter on reporter.id=r.reporter_id left join bandhanaa_private.admin_report_details d on d.report_id=r.id left join public.admin_users a on a.id=d.assigned_admin_id left join public.profiles ap on ap.id=a.user_id where (detail_id is null or r.id::text=detail_id) and (status_filter='' or r.status=status_filter) and (reason_filter='' or r.reason=reason_filter) and (member_id is null or r.reported_id=member_id or r.reporter_id=member_id) and (search='' or p.display_name ilike pattern or reporter.display_name ilike pattern) and (start_at is null or r.created_at>=start_at) and (end_at is null or r.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select r.id::text as id,p.display_name as reported_member,p.id as reported_id,reporter.display_name as reported_by,reporter.id as reporter_id,r.reason,r.status,r.created_at as date,ap.display_name as assigned_admin from public.member_reports r left join public.profiles p on p.id=r.reported_id left join public.profiles reporter on reporter.id=r.reporter_id left join bandhanaa_private.admin_report_details d on d.report_id=r.id left join public.admin_users a on a.id=d.assigned_admin_id left join public.profiles ap on ap.id=a.user_id where (detail_id is null or r.id::text=detail_id) and (status_filter='' or r.status=status_filter) and (reason_filter='' or r.reason=reason_filter) and (member_id is null or r.reported_id=member_id or r.reporter_id=member_id) and (search='' or p.display_name ilike pattern or reporter.display_name ilike pattern) and (start_at is null or r.created_at>=start_at) and (end_at is null or r.created_at<end_at) order by r.created_at desc,r.id desc limit page_size offset (page_number-1)*page_size
    ) r;

    if detail_id is not null then
      select to_jsonb(r) into member from (select r.id::text as id,p.display_name as reported_member,p.id as reported_id,reporter.display_name as reported_by,reporter.id as reporter_id,r.reason,r.status,r.created_at as date,ap.display_name as assigned_admin,r.details,d.resolution_note,d.resolved_at,p.account_status as account_status
        from public.member_reports r left join public.profiles p on p.id=r.reported_id left join public.profiles reporter on reporter.id=r.reporter_id left join bandhanaa_private.admin_report_details d on d.report_id=r.id left join public.admin_users a on a.id=d.assigned_admin_id left join public.profiles ap on ap.id=a.user_id where r.id::text=detail_id) r;
      result:=jsonb_build_object('detail',member);
    end if;
  elsif p_section='referrals' then
    select count(*) into item_count from public.referrals r left join public.profiles a on a.id=r.inviter_id left join public.profiles b on b.id=r.referred_user_id left join public.message_credit_transactions t on t.referral_id=r.id and t.transaction_type='referral_reward' where (status_filter='' or r.status=status_filter) and (search='' or a.display_name ilike pattern or b.display_name ilike pattern or r.referral_code ilike pattern) and (start_at is null or r.registered_at>=start_at) and (end_at is null or r.registered_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select r.id,a.display_name as referrer,a.id as referrer_id,b.display_name as referred_member,b.id as referred_id,r.referral_code,r.registered_at as date,r.status,b.registration_status as signup_status,r.verified_at as qualified_at,coalesce(t.amount,0) as reward,r.rewarded_at from public.referrals r left join public.profiles a on a.id=r.inviter_id left join public.profiles b on b.id=r.referred_user_id left join public.message_credit_transactions t on t.referral_id=r.id and t.transaction_type='referral_reward' where (status_filter='' or r.status=status_filter) and (search='' or a.display_name ilike pattern or b.display_name ilike pattern or r.referral_code ilike pattern) and (start_at is null or r.registered_at>=start_at) and (end_at is null or r.registered_at<end_at) order by r.registered_at desc,r.id desc limit page_size offset (page_number-1)*page_size
    ) r;

    select jsonb_build_object('total_referrals',count(*),'qualified_referrals',count(*) filter(where status='rewarded'),'pending_qualification',count(*) filter(where status='registered'),
      'credits_awarded',(select coalesce(sum(amount),0) from public.message_credit_transactions where transaction_type='referral_reward')) into metrics from public.referrals;
  elsif p_section='chat-credits' then
    if member_id is not null then
    select count(*) into item_count from public.message_credit_transactions t where t.user_id=member_id;
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select t.id,t.created_at as date,t.transaction_type as type,t.amount as change,t.balance_after as balance,coalesce(t.purchase_id::text,t.referral_id::text,t.message_id::text,t.admin_request_id::text) as reference from public.message_credit_transactions t where t.user_id=member_id order by t.created_at desc,t.id desc limit page_size offset (page_number-1)*page_size
    ) r;

      select jsonb_build_object('id',p.id,'name',p.display_name,'email',au.email,'balance',coalesce(w.available_credits,0)) into member
      from public.profiles p join auth.users au on au.id=p.id left join public.message_credit_wallets w on w.user_id=p.id where p.id=member_id;
      result:=jsonb_build_object('member',member);
    else
    select count(*) into item_count from public.profiles p join auth.users au on au.id=p.id left join public.message_credit_wallets w on w.user_id=p.id left join lateral (select sum(amount) filter(where transaction_type='referral_reward') as referral,sum(amount) filter(where transaction_type='payment_purchase') as purchased,-sum(amount) filter(where transaction_type='message_spend') as used,sum(amount) filter(where transaction_type='admin_adjustment') as adjusted from public.message_credit_transactions where user_id=p.id) l on true where (search='' or p.display_name ilike pattern or au.email ilike pattern or p.id::text=search);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select p.id,p.display_name as name,au.email,coalesce(w.available_credits,0) as balance,coalesce(l.referral,0) as referral_credits,coalesce(l.purchased,0) as purchased_credits,coalesce(l.used,0) as credits_used,coalesce(l.adjusted,0) as adjusted,w.updated_at as last_activity from public.profiles p join auth.users au on au.id=p.id left join public.message_credit_wallets w on w.user_id=p.id left join lateral (select sum(amount) filter(where transaction_type='referral_reward') as referral,sum(amount) filter(where transaction_type='payment_purchase') as purchased,-sum(amount) filter(where transaction_type='message_spend') as used,sum(amount) filter(where transaction_type='admin_adjustment') as adjusted from public.message_credit_transactions where user_id=p.id) l on true where (search='' or p.display_name ilike pattern or au.email ilike pattern or p.id::text=search) order by w.updated_at desc nulls last,p.id limit page_size offset (page_number-1)*page_size
    ) r;

    end if;
    select jsonb_build_object('credits_issued',coalesce(sum(amount) filter(where amount>0),0),'credits_purchased',coalesce(sum(amount) filter(where transaction_type='payment_purchase'),0),
      'credits_used',coalesce(-sum(amount) filter(where transaction_type='message_spend'),0),'outstanding_balance',(select coalesce(sum(available_credits),0) from public.message_credit_wallets))
      into metrics from public.message_credit_transactions;
  elsif p_section='payments' then
    select count(*) into item_count from public.message_credit_purchases t left join public.profiles p on p.id=t.user_id left join auth.users au on au.id=t.user_id where (status_filter='' or t.status=status_filter) and (member_id is null or t.user_id=member_id) and (search='' or p.display_name ilike pattern or au.email ilike pattern or t.order_id ilike pattern) and (start_at is null or t.created_at>=start_at) and (end_at is null or t.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select t.id,p.display_name as name,au.email,t.user_id as member_id,t.provider,t.order_id,t.razorpay_payment_id as payment_id,t.amount_paise,t.credits,t.status,t.payment_mode,t.created_at as date,t.paid_at from public.message_credit_purchases t left join public.profiles p on p.id=t.user_id left join auth.users au on au.id=t.user_id where (status_filter='' or t.status=status_filter) and (member_id is null or t.user_id=member_id) and (search='' or p.display_name ilike pattern or au.email ilike pattern or t.order_id ilike pattern) and (start_at is null or t.created_at>=start_at) and (end_at is null or t.created_at<end_at) order by t.created_at desc,t.id desc limit page_size offset (page_number-1)*page_size
    ) r;

  elsif p_section='support' then
    select count(*) into item_count from public.support_requests s left join public.profiles p on p.id=s.user_id left join auth.users au on au.id=s.user_id left join public.admin_users a on a.id=s.assigned_admin_id left join public.profiles ap on ap.id=a.user_id where (detail_id is null or s.id::text=detail_id) and (status_filter='' or s.status=status_filter) and (search='' or p.display_name ilike pattern or au.email ilike pattern or s.subject ilike pattern) and (start_at is null or s.created_at>=start_at) and (end_at is null or s.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select s.id,p.display_name as name,au.email,s.subject,s.status,s.email_delivery_status as delivery,s.created_at as date,ap.display_name as assigned_admin from public.support_requests s left join public.profiles p on p.id=s.user_id left join auth.users au on au.id=s.user_id left join public.admin_users a on a.id=s.assigned_admin_id left join public.profiles ap on ap.id=a.user_id where (detail_id is null or s.id::text=detail_id) and (status_filter='' or s.status=status_filter) and (search='' or p.display_name ilike pattern or au.email ilike pattern or s.subject ilike pattern) and (start_at is null or s.created_at>=start_at) and (end_at is null or s.created_at<end_at) order by s.created_at desc,s.id desc limit page_size offset (page_number-1)*page_size
    ) r;

    if detail_id is not null then
      select jsonb_build_object('id',s.id,'member_id',s.user_id,'name',p.display_name,'email',au.email,'subject',s.subject,'body',s.body,'status',s.status,
        'internal_note',s.internal_note,'delivery',s.email_delivery_status,'date',s.created_at) into member
      from public.support_requests s left join public.profiles p on p.id=s.user_id left join auth.users au on au.id=s.user_id where s.id::text=detail_id;
      result:=jsonb_build_object('detail',member);
    end if;
  elsif p_section='audit' then
    select count(*) into item_count from public.admin_audit_logs l join public.admin_users a on a.id=l.admin_user_id left join public.profiles p on p.id=a.user_id where (search='' or l.action ilike pattern or l.target_id=search or p.display_name ilike pattern) and (start_at is null or l.created_at>=start_at) and (end_at is null or l.created_at<end_at);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select l.id,coalesce(p.display_name,'Administrator') as administrator,l.action,l.target_type,l.target_id,l.reason,l.metadata::text as metadata,l.created_at as date from public.admin_audit_logs l join public.admin_users a on a.id=l.admin_user_id left join public.profiles p on p.id=a.user_id where (search='' or l.action ilike pattern or l.target_id=search or p.display_name ilike pattern) and (start_at is null or l.created_at>=start_at) and (end_at is null or l.created_at<end_at) order by l.created_at desc,l.id desc limit page_size offset (page_number-1)*page_size
    ) r;

  elsif p_section='admins' then
    select count(*) into item_count from public.admin_users a join auth.users u on u.id=a.user_id left join public.profiles p on p.id=a.user_id where (search='' or p.display_name ilike pattern or u.email ilike pattern);
    select coalesce(jsonb_agg(to_jsonb(r)),'[]') into items from (
      select a.id,a.user_id,p.display_name as name,u.email,a.role,a.is_active,a.created_at as date from public.admin_users a join auth.users u on u.id=a.user_id left join public.profiles p on p.id=a.user_id where (search='' or p.display_name ilike pattern or u.email ilike pattern) order by a.created_at desc,a.id limit page_size offset (page_number-1)*page_size
    ) r;

  elsif p_section='settings' then
    items:='[]';
  else raise exception 'Unknown section' using errcode='22023'; end if;
  return result||jsonb_build_object('rows',items,'total',item_count,'page',page_number,'page_size',page_size,'metrics',metrics);
end $$;
revoke all on function bandhanaa_private.read(text,jsonb) from public,anon,authenticated;
grant execute on function bandhanaa_private.read(text,jsonb) to authenticated;
create function public.admin_query(p_section text,p_filters jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select bandhanaa_private.read(p_section,p_filters)$$;
revoke all on function public.admin_query(text,jsonb) from public,anon,authenticated;
grant execute on function public.admin_query(text,jsonb) to authenticated;

-- Keep suspended/private profiles out of the existing definer visitor RPC.
create or replace function public.get_recent_profile_visitors(result_limit integer default 8)
returns table (
  id uuid,
  display_name text,
  profession text,
  city text,
  state text,
  country text,
  avatar_url text,
  photos text[],
  gender text,
  last_seen_at timestamptz,
  viewed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    recent.id,
    recent.display_name,
    recent.profession,
    recent.city,
    recent.state,
    recent.country,
    recent.avatar_url,
    recent.photos,
    recent.gender,
    recent.last_seen_at,
    recent.viewed_at
  from (
    select distinct on (ua.user_id)
      p.id,
      p.display_name,
      p.profession,
      p.city,
      p.state,
      p.country,
      p.avatar_url,
      p.photos,
      p.gender,
      p.last_seen_at,
      ua.created_at as viewed_at
    from public.user_activity ua
    join public.profiles p on p.id = ua.user_id
    where ua.activity_type = 'profile_viewed'
      and ua.target_user_id = (select auth.uid())
      and ua.user_id <> (select auth.uid())
      and p.is_discoverable = true
      and public.can_view_profile((select auth.uid()), p.id)
    order by ua.user_id, ua.created_at desc
  ) recent
  order by recent.viewed_at desc
  limit greatest(1, least(coalesce(result_limit, 8), 12));
$$;

revoke execute on function public.get_recent_profile_visitors(integer) from public, anon;
grant execute on function public.get_recent_profile_visitors(integer) to authenticated;

-- No web-accessible bootstrap function; use the deliberately owner-run script.
notify pgrst,'reload schema';
commit;
