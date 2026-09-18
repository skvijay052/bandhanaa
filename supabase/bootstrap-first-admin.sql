-- Run ONCE, intentionally, as the database owner in the trusted SQL editor.
-- Replace only the UUID literal below after verifying it in Authentication > Users.
-- This script is not an application migration and MUST NOT be auto-deployed.
begin;
lock table public.admin_users in exclusive mode;
do $$
declare
  chosen_user_id uuid := 'REPLACE_WITH_EXISTING_CONFIRMED_USER_UUID';
  new_admin_id uuid;
begin
  if exists(select 1 from public.admin_users) then
    raise exception 'Bootstrap refused: administrator membership already exists. Use Admins & Roles.';
  end if;
  if not exists(select 1 from auth.users where id=chosen_user_id and email_confirmed_at is not null) then
    raise exception 'Choose an existing email-confirmed Supabase user.';
  end if;
  if exists(select 1 from public.profiles where id=chosen_user_id and account_status<>'active') then
    raise exception 'The selected account is suspended or disabled.';
  end if;
  insert into public.admin_users(user_id,role,is_active)
    values(chosen_user_id,'super_admin',true) returning id into new_admin_id;
  insert into public.admin_audit_logs(admin_user_id,action,target_type,target_id,reason,metadata)
    values(new_admin_id,'admin_created','admin',chosen_user_id::text,
      'Initial super administrator assigned intentionally by database owner',
      jsonb_build_object('role','super_admin','procedure','trusted_bootstrap'));
end $$;
commit;
