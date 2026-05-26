CREATE OR REPLACE FUNCTION public.profiles_enforce_role_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
BEGIN
  IF OLD.role IS NOT DISTINCT FROM NEW.role THEN
    RETURN NEW;
  END IF;

  IF OLD.role = 'buyer'::text AND NEW.role = 'farmer'::text THEN
    IF current_setting('farmly.allow_farmer_promotion', true) IS DISTINCT FROM '1' THEN
      RAISE EXCEPTION 'Farmer role must be granted via become_farmer()';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS profiles_before_update_enforce_role ON public.profiles;
CREATE TRIGGER profiles_before_update_enforce_role
  BEFORE UPDATE OF role
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_enforce_role_transition();

CREATE OR REPLACE FUNCTION public.become_farmer()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
DECLARE
  uid uuid := auth.uid();
  profile_name text;
  farmer_slug text;
  farmer_id uuid;
  v_listing_complete boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT
    name,
    is_profile_complete
  INTO profile_name, v_listing_complete
  FROM public.profiles
  WHERE id = uid;

  IF profile_name IS NULL OR trim(profile_name) = '' THEN
    profile_name := 'Farmer';
  END IF;

  PERFORM set_config('farmly.allow_farmer_promotion', '1', true);

  UPDATE public.profiles
  SET role = 'farmer', updated_at = now()
  WHERE id = uid;

  SELECT fp.id INTO farmer_id
  FROM public.farmer_profiles fp
  WHERE fp.profile_id = uid;

  IF farmer_id IS NOT NULL THEN
    RETURN farmer_id;
  END IF;

  farmer_slug := public.generate_farmer_slug(profile_name, uid);

  INSERT INTO public.farmer_profiles (
    profile_id,
    slug,
    public_display_name,
    public_avatar_url,
    listing_profile_complete
  )
  SELECT
    uid,
    farmer_slug,
    COALESCE(NULLIF(TRIM(p.name), ''), profile_name),
    p.avatar_url,
    COALESCE(p.is_profile_complete, false)
  FROM public.profiles p
  WHERE p.id = uid
  RETURNING id INTO farmer_id;

  IF farmer_id IS NULL THEN
    RAISE EXCEPTION 'become_farmer: profile row missing for user';
  END IF;

  RETURN farmer_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public.become_farmer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.become_farmer() TO authenticated;
;
