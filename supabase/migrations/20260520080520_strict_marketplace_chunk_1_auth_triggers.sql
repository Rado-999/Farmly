CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
BEGIN
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
    'buyer',
    false,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    name = COALESCE(
      NULLIF(TRIM(EXCLUDED.name::text), ''),
      public.profiles.name
    );

  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.sync_farmer_public_fields_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
BEGIN
  UPDATE public.farmer_profiles fp
  SET
    public_display_name = COALESCE(
      NULLIF(TRIM(NEW.name), ''),
      fp.public_display_name
    ),
    public_avatar_url = NEW.avatar_url,
    listing_profile_complete = NEW.is_profile_complete
  WHERE fp.profile_id = NEW.id;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS profiles_after_change_sync_farmer_public ON public.profiles;
CREATE TRIGGER profiles_after_change_sync_farmer_public
  AFTER INSERT OR UPDATE OF name, avatar_url, is_profile_complete
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_farmer_public_fields_from_profile();

CREATE OR REPLACE FUNCTION public.reviews_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $fn$
DECLARE
  v_farmer_id uuid;
  v_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'reviews.user_id must match authenticated user';
    END IF;
    IF NEW.product_id IS NULL THEN
      RAISE EXCEPTION 'reviews.product_id is required';
    END IF;

    SELECT p.farmer_id INTO v_farmer_id
    FROM public.products p
    WHERE p.id = NEW.product_id;

    IF v_farmer_id IS NULL THEN
      RAISE EXCEPTION 'invalid reviews.product_id';
    END IF;

    NEW.farmer_id := v_farmer_id;

    SELECT COALESCE(NULLIF(TRIM(p.name), ''), 'Member')
    INTO v_name
    FROM public.profiles p
    WHERE p.id = NEW.user_id;

    IF v_name IS NULL THEN
      RAISE EXCEPTION 'reviewer profile missing';
    END IF;

    NEW.author_display_name := v_name;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.product_id IS DISTINCT FROM OLD.product_id
       OR NEW.farmer_id IS DISTINCT FROM OLD.farmer_id
    THEN
      RAISE EXCEPTION 'cannot reassign review';
    END IF;

    SELECT COALESCE(NULLIF(TRIM(p.name), ''), 'Member')
    INTO v_name
    FROM public.profiles p
    WHERE p.id = NEW.user_id;

    NEW.author_display_name := COALESCE(v_name, OLD.author_display_name);
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS reviews_before_write_trigger ON public.reviews;
CREATE TRIGGER reviews_before_write_trigger
  BEFORE INSERT OR UPDATE
  ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.reviews_before_write();;
