-- Run once in the Supabase SQL Editor for dependent Country / State / City fields.
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists state text;

-- Preserve existing combined values such as "Bengaluru, Karnataka".
update public.profiles
set
  state = coalesce(state, nullif(trim(split_part(city, ',', 2)), '')),
  city = case
    when position(',' in coalesce(city, '')) > 0 then nullif(trim(split_part(city, ',', 1)), '')
    else city
  end,
  country = coalesce(country, 'India')
where city is not null;
