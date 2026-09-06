-- Run in the Supabase SQL editor after schema.sql and
-- registration-verification-lifecycle.sql. Creates 60 fictional demo profiles.
-- Reserved .invalid emails, no passwords, no email delivery.
-- Repeat runs update only records belonging to this seed.
begin;

do $$
declare
  male_names text[] := array['Arjun','Vijay','Karthik','Aditya','Rahul','Rohan','Vikram','Surya','Arun','Pranav','Nikhil','Varun','Sanjay','Ajay','Siddharth','Akash','Harish','Dinesh','Ashwin','Gautam','Naveen','Manoj','Abhishek','Raghav','Deepak','Kiran','Prakash','Bharath','Sathish','Anirudh'];
  female_names text[] := array['Priya','Ananya','Divya','Kavya','Meera','Sneha','Aishwarya','Nithya','Pooja','Shruti','Swathi','Keerthana','Janani','Lakshmi','Anjali','Shreya','Riya','Neha','Ishita','Diya','Sanjana','Harini','Pavithra','Yamini','Nandini','Akshara','Sowmya','Vaishnavi','Deepika','Madhumitha'];
  cities text[] := array['Chennai','Coimbatore','Madurai','Bengaluru','Hyderabad','Mumbai'];
  states text[] := array['Tamil Nadu','Tamil Nadu','Tamil Nadu','Karnataka','Telangana','Maharashtra'];
  languages text[] := array['Tamil','Tamil','Tamil','Kannada','Telugu','Marathi'];
  jobs text[] := array['Software Engineer','Architect','Teacher','Designer','Accountant','Business Analyst'];
  educations text[] := array['B.Tech','B.Arch','M.Ed','B.Des','M.Com','MBA'];
  seed_id uuid;
  seed_email text;
  seed_gender text;
  seed_name text;
  seed_birth date;
  i integer;
  g integer;
  slot integer;
begin
  for g in 1..2 loop
    seed_gender := case when g = 1 then 'Male' else 'Female' end;
    for i in 1..30 loop
      seed_email := 'demo.' || lower(seed_gender) || '.' || lpad(i::text, 2, '0') || '@bandhanaa.invalid';
      seed_id := md5('bandhanaa-demo-profiles-v1:' || seed_email)::uuid;
      seed_name := case when g = 1 then male_names[i] else female_names[i] end;
      seed_birth := (current_date - make_interval(years => 24 + ((i - 1) % 12)))::date;
      slot := 1 + ((i - 1) % 6);

      if exists (
        select 1 from auth.users
        where (id = seed_id or email = seed_email)
          and (id <> seed_id or email is distinct from seed_email
            or raw_app_meta_data ->> 'demo_seed' is distinct from 'bandhanaa-demo-profiles-v1')
      ) then
        raise exception 'Seed identity collision for %', seed_email;
      end if;

      insert into auth.users (
        instance_id, id, aud, role, email, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000', seed_id, 'authenticated',
        'authenticated', seed_email, now(),
        '{"provider":"email","providers":["email"],"demo_seed":"bandhanaa-demo-profiles-v1"}'::jsonb,
        jsonb_build_object('display_name', seed_name, 'gender', seed_gender, 'birth_date', seed_birth),
        now(), now()
      ) on conflict (id) do update set
        raw_user_meta_data = auth.users.raw_user_meta_data ||
          jsonb_build_object('display_name', seed_name),
        updated_at = now();

      insert into public.profiles (
        id, email, display_name, gender, birth_date, age, profession,
        city, state, country, religion, education, height, mother_tongue,
        marital_status, bio, avatar_url, photos, profile_visibility,
        profile_completion, compatibility, is_discoverable,
        registration_status, onboarding_completed, is_verified
      ) values (
        seed_id, seed_email, seed_name, seed_gender, seed_birth,
        24 + ((i - 1) % 12), jobs[slot], cities[slot], states[slot],
        'India', 'Hindu', educations[slot],
        case when g = 1 then '175 cm' else '163 cm' end,
        languages[slot], 'Never Married',
        'Fictional demo profile for testing Bandhanaa. Enjoys travel, music, and spending time with family.',
        null, '{}'::text[], 'everyone', 85, 70 + (i % 26), true,
        'active', true, true
      ) on conflict (id) do update set
        display_name = excluded.display_name,
        gender = excluded.gender,
        birth_date = excluded.birth_date,
        age = excluded.age,
        profession = excluded.profession,
        city = excluded.city,
        state = excluded.state,
        country = excluded.country,
        religion = excluded.religion,
        education = excluded.education,
        height = excluded.height,
        mother_tongue = excluded.mother_tongue,
        marital_status = excluded.marital_status,
        bio = excluded.bio,
        profile_visibility = excluded.profile_visibility,
        profile_completion = excluded.profile_completion,
        compatibility = excluded.compatibility,
        is_discoverable = true,
        registration_status = 'active',
        onboarding_completed = true,
        is_verified = true;
    end loop;
  end loop;
end $$;

-- Expected: Female = 30, Male = 30.
select p.gender, count(*) as demo_profiles
from public.profiles p
join auth.users u on u.id = p.id
where u.raw_app_meta_data ->> 'demo_seed' = 'bandhanaa-demo-profiles-v1'
group by p.gender
order by p.gender;

commit;