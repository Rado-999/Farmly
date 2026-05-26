-- profiles: add email
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- farmers -> farmer_profiles
ALTER TABLE public.farmers RENAME TO farmer_profiles;
ALTER TABLE public.farmer_profiles RENAME COLUMN user_id TO profile_id;

ALTER INDEX IF EXISTS farmers_user_id_key RENAME TO farmer_profiles_profile_id_key;
ALTER INDEX IF EXISTS farmers_slug_key RENAME TO farmer_profiles_slug_key;
ALTER INDEX IF EXISTS idx_farmers_slug RENAME TO idx_farmer_profiles_slug;

-- Seed/demo rows without a linked profile keep a display name
ALTER TABLE public.farmer_profiles
  ADD COLUMN IF NOT EXISTS display_name text;

UPDATE public.farmer_profiles
SET display_name = name
WHERE profile_id IS NULL
  AND display_name IS NULL;

UPDATE public.profiles p
SET name = f.name
FROM public.farmer_profiles f
WHERE f.profile_id = p.id
  AND (p.name IS NULL OR trim(p.name) = '');

ALTER TABLE public.farmer_profiles
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS verification_status,
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS reviews_count,
  DROP COLUMN IF EXISTS followers_count;

-- RLS policies
DROP POLICY IF EXISTS "Public read farmers" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Authenticated users can create farmers" ON public.farmer_profiles;

CREATE POLICY "Public read farmer profiles"
  ON public.farmer_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create own farmer profile"
  ON public.farmer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own farmer profile"
  ON public.farmer_profiles
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Signup: one profile per user, default buyer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  display_name text := nullif(trim(NEW.raw_user_meta_data->>'full_name'), '');
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    display_name,
    NEW.email,
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    name = COALESCE(EXCLUDED.name, public.profiles.name);

  RETURN NEW;
END;
$$;

-- Upgrade path: buyer -> farmer (same account)
CREATE OR REPLACE FUNCTION public.become_farmer()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  profile_name text;
  farmer_slug text;
  farmer_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT name INTO profile_name
  FROM public.profiles
  WHERE id = uid;

  IF profile_name IS NULL OR trim(profile_name) = '' THEN
    profile_name := 'Farmer';
  END IF;

  UPDATE public.profiles
  SET role = 'farmer', updated_at = now()
  WHERE id = uid;

  SELECT id INTO farmer_id
  FROM public.farmer_profiles
  WHERE profile_id = uid;

  IF farmer_id IS NOT NULL THEN
    RETURN farmer_id;
  END IF;

  farmer_slug := public.generate_farmer_slug(profile_name, uid);

  INSERT INTO public.farmer_profiles (profile_id, slug)
  VALUES (uid, farmer_slug)
  RETURNING id INTO farmer_id;

  RETURN farmer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.become_farmer() TO authenticated;;
