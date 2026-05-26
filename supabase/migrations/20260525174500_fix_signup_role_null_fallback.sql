-- Ensure auth profile bootstrap falls back to `buyer` when signup metadata omits role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
DECLARE
  signup_role text;
BEGIN
  signup_role := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), '');

  IF signup_role IS NULL OR signup_role NOT IN ('buyer', 'farmer') THEN
    signup_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    is_profile_complete,
    onboarding_step
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    signup_role,
    false,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    name = COALESCE(
      NULLIF(TRIM(EXCLUDED.name::text), ''),
      public.profiles.name
    ),
    role = CASE
      WHEN public.profiles.role = 'farmer' THEN public.profiles.role
      ELSE EXCLUDED.role
    END;

  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
