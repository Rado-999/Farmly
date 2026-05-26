-- One public farmer profile per user
CREATE UNIQUE INDEX IF NOT EXISTS farmers_user_id_key
  ON public.farmers (user_id);

CREATE OR REPLACE FUNCTION public.generate_farmer_slug(
  display_name text,
  user_id uuid
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate_slug text;
BEGIN
  base_slug := lower(
    regexp_replace(
      regexp_replace(coalesce(trim(display_name), ''), '[^a-zA-Z0-9]+', '-', 'g'),
      '(^-|-$)',
      '',
      'g'
    )
  );

  IF base_slug = '' THEN
    base_slug := 'farmer';
  END IF;

  candidate_slug := base_slug;

  IF EXISTS (SELECT 1 FROM public.farmers WHERE slug = candidate_slug) THEN
    candidate_slug := base_slug || '-' || left(replace(user_id::text, '-', ''), 8);
  END IF;

  RETURN candidate_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  selected_role text := coalesce(NEW.raw_user_meta_data->>'role', 'buyer');
  display_name text := nullif(trim(NEW.raw_user_meta_data->>'full_name'), '');
  farmer_slug text;
BEGIN
  IF selected_role NOT IN ('buyer', 'farmer') THEN
    selected_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    display_name,
    selected_role
  )
  ON CONFLICT (id) DO NOTHING;

  IF selected_role = 'farmer' THEN
    farmer_slug := public.generate_farmer_slug(
      coalesce(display_name, 'Farmer'),
      NEW.id
    );

    INSERT INTO public.farmers (user_id, name, slug)
    VALUES (
      NEW.id,
      coalesce(display_name, 'Farmer'),
      farmer_slug
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill farmer profiles created before this migration
INSERT INTO public.farmers (user_id, name, slug)
SELECT
  p.id,
  coalesce(nullif(trim(p.name), ''), 'Farmer'),
  public.generate_farmer_slug(coalesce(nullif(trim(p.name), ''), 'Farmer'), p.id)
FROM public.profiles p
WHERE p.role = 'farmer'
  AND NOT EXISTS (
    SELECT 1 FROM public.farmers f WHERE f.user_id = p.id
  )
ON CONFLICT (user_id) DO NOTHING;;
