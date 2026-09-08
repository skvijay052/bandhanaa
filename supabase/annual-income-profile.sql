-- Annual income support for registration, profile editing and profile views.
-- Safe to run after adding public.profiles.annual_income.

alter table public.profiles
  add column if not exists annual_income text;

grant update (annual_income) on table public.profiles to authenticated;

create or replace function public.complete_verified_registration(
  profile_data jsonb,
  preferences jsonb
)
returns table (registration_status text, onboarding_completed boolean, is_verified boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  confirmed boolean;
begin
  select u.email, u.email_confirmed_at is not null
    into current_email, confirmed
  from auth.users u
  where u.id = current_user_id;

  if current_user_id is null or current_email is null then
    raise exception 'Authentication required';
  end if;
  if not confirmed then
    raise exception 'Email verification required';
  end if;

  insert into public.profiles (
    id, email, display_name, birth_date, age, gender, religion,
    mother_tongue, marital_status, height, weight, country, state, city,
    education, profession, company, annual_income, partner_preferences, horoscope,
    registration_status, onboarding_completed, is_verified, is_discoverable
  ) values (
    current_user_id,
    current_email,
    nullif(trim(profile_data ->> 'display_name'), ''),
    nullif(profile_data ->> 'birth_date', '')::date,
    date_part('year', age(nullif(profile_data ->> 'birth_date', '')::date))::integer,
    nullif(trim(profile_data ->> 'gender'), ''),
    nullif(trim(profile_data ->> 'religion'), ''),
    nullif(trim(profile_data ->> 'mother_tongue'), ''),
    nullif(trim(profile_data ->> 'marital_status'), ''),
    nullif(trim(profile_data ->> 'height'), ''),
    nullif(trim(profile_data ->> 'weight'), ''),
    coalesce(nullif(trim(profile_data ->> 'country'), ''), 'India'),
    nullif(trim(profile_data ->> 'state'), ''),
    nullif(trim(profile_data ->> 'city'), ''),
    nullif(trim(profile_data ->> 'education'), ''),
    nullif(trim(profile_data ->> 'profession'), ''),
    nullif(trim(profile_data ->> 'company'), ''),
    nullif(trim(profile_data ->> 'annual_income'), ''),
    coalesce(preferences, '[]'::jsonb),
    coalesce(profile_data -> 'horoscope', '[]'::jsonb),
    'active', true, true, true
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    birth_date = excluded.birth_date,
    age = excluded.age,
    gender = excluded.gender,
    religion = excluded.religion,
    mother_tongue = excluded.mother_tongue,
    marital_status = excluded.marital_status,
    height = excluded.height,
    weight = excluded.weight,
    country = excluded.country,
    state = excluded.state,
    city = excluded.city,
    education = excluded.education,
    profession = excluded.profession,
    company = excluded.company,
    annual_income = excluded.annual_income,
    partner_preferences = excluded.partner_preferences,
    horoscope = excluded.horoscope,
    registration_status = 'active',
    onboarding_completed = true,
    is_verified = true,
    is_discoverable = true;

  return query
  select p.registration_status, p.onboarding_completed, p.is_verified
  from public.profiles p
  where p.id = current_user_id;
end;
$$;

revoke execute on function public.complete_verified_registration(jsonb, jsonb) from public, anon;
grant execute on function public.complete_verified_registration(jsonb, jsonb) to authenticated;
