-- ============================================================================
-- Farmly strict marketplace: constraints, triggers, RLS (idempotent patterns)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A. Clean orphans that block NOT NULL / FK hardening
-- ---------------------------------------------------------------------------
DELETE FROM public.reviews r
WHERE r.product_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id = r.product_id);

DELETE FROM public.reviews r
WHERE r.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = r.user_id);

DELETE FROM public.follows f
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = f.user_id)
   OR NOT EXISTS (SELECT 1 FROM public.farmer_profiles fp WHERE fp.id = f.farmer_id);

DELETE FROM public.products p
WHERE NOT EXISTS (SELECT 1 FROM public.farmer_profiles fp WHERE fp.id = p.farmer_id);

DELETE FROM public.videos v
WHERE NOT EXISTS (SELECT 1 FROM public.farmer_profiles fp WHERE fp.id = v.farmer_id);

DELETE FROM public.posts po
WHERE NOT EXISTS (SELECT 1 FROM public.farmer_profiles fp WHERE fp.id = po.farmer_id);

DELETE FROM public.farmer_profiles fp
WHERE fp.profile_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = fp.profile_id);

DELETE FROM public.farmer_profiles WHERE profile_id IS NULL;

DELETE FROM public.follows a
USING public.follows b
WHERE a.user_id = b.user_id
  AND a.farmer_id = b.farmer_id
  AND a.ctid < b.ctid;

DELETE FROM public.farmer_profiles fp1
USING public.farmer_profiles fp2
WHERE fp1.profile_id = fp2.profile_id
  AND fp1.ctid < fp2.ctid;

-- ---------------------------------------------------------------------------
-- B. Columns: denormalized farmer listing + review author (public-safe)
-- ---------------------------------------------------------------------------
ALTER TABLE public.farmer_profiles
  ADD COLUMN IF NOT EXISTS public_display_name text,
  ADD COLUMN IF NOT EXISTS public_avatar_url text,
  ADD COLUMN IF NOT EXISTS listing_profile_complete boolean NOT NULL DEFAULT false;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS author_display_name text NOT NULL DEFAULT 'Member';

UPDATE public.reviews SET author_display_name = 'Member' WHERE author_display_name IS NULL;

UPDATE public.farmer_profiles fp
SET
  public_display_name = COALESCE(
    NULLIF(TRIM(p.name), ''),
    NULLIF(TRIM(fp.display_name), ''),
    INITCAP(REPLACE(fp.slug, '-', ' '))
  ),
  public_avatar_url = p.avatar_url,
  listing_profile_complete = COALESCE(p.is_profile_complete, false)
FROM public.profiles p
WHERE fp.profile_id = p.id;

UPDATE public.reviews r
SET author_display_name = COALESCE(NULLIF(TRIM(p.name), ''), r.author_display_name, 'Member')
FROM public.profiles p
WHERE r.user_id = p.id;

UPDATE public.reviews r
SET farmer_id = p.farmer_id
FROM public.products p
WHERE r.product_id = p.id AND (r.farmer_id IS NULL OR r.farmer_id IS DISTINCT FROM p.farmer_id);

-- ---------------------------------------------------------------------------
-- C. NOT NULL + uniques
-- ---------------------------------------------------------------------------
ALTER TABLE public.farmer_profiles
  ALTER COLUMN profile_id SET NOT NULL;

ALTER TABLE public.posts
  ALTER COLUMN farmer_id SET NOT NULL;

ALTER TABLE public.products
  ALTER COLUMN farmer_id SET NOT NULL;

ALTER TABLE public.videos
  ALTER COLUMN farmer_id SET NOT NULL;

ALTER TABLE public.follows
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN farmer_id SET NOT NULL;

ALTER TABLE public.reviews
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN farmer_id SET NOT NULL,
  ALTER COLUMN product_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user_product
  ON public.reviews (user_id, product_id);

CREATE UNIQUE INDEX IF NOT EXISTS farmer_profiles_one_per_profile
  ON public.farmer_profiles (profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS follows_one_per_user_farmer
  ON public.follows (user_id, farmer_id);

-- ---------------------------------------------------------------------------
-- D. Foreign keys with ON DELETE (idempotent recreate)
-- ---------------------------------------------------------------------------
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_farmer_id_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_farmer_id_fkey
  FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles (id) ON DELETE CASCADE;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_farmer_id_fkey;
ALTER TABLE public.products
  ADD CONSTRAINT products_farmer_id_fkey
  FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles (id) ON DELETE CASCADE;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_farmer_id_fkey;
ALTER TABLE public.videos
  ADD CONSTRAINT videos_farmer_id_fkey
  FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles (id) ON DELETE CASCADE;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_product_id_fkey;
ALTER TABLE public.videos
  ADD CONSTRAINT videos_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE SET NULL;

-- reviews: composite FK ensures farmer_id matches the product row (integrity only)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_id_farmer_unique;
ALTER TABLE public.products
  ADD CONSTRAINT products_id_farmer_unique UNIQUE (id, farmer_id);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_farmer_id_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_farmer_fkey;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_product_farmer_fkey
  FOREIGN KEY (product_id, farmer_id)
  REFERENCES public.products (id, farmer_id)
  ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_user_id_fkey;
ALTER TABLE public.follows
  ADD CONSTRAINT follows_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_farmer_id_fkey;
ALTER TABLE public.follows
  ADD CONSTRAINT follows_farmer_id_fkey
  FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles (id) ON DELETE CASCADE;

ALTER TABLE public.farmer_profiles DROP CONSTRAINT IF EXISTS farmers_user_id_fkey;
ALTER TABLE public.farmer_profiles
  ADD CONSTRAINT farmer_profiles_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles (id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- E. Auth → profile (idempotent)
-- ---------------------------------------------------------------------------
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

-- Business logic (reviews, farmer mirror fields, become_farmer) lives in the app layer.
-- DB: constraints, FKs, RLS (ownership / visibility only), and handle_new_user above.

-- ---------------------------------------------------------------------------
-- F. Enable row level security (policies have no effect until RLS is on)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- I. Drop old RLS policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read farmer profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can create own farmer profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can update own farmer profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_select_public" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_insert_own" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_update_own" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_delete_own" ON public.farmer_profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_insert_farmer" ON public.products;
DROP POLICY IF EXISTS "products_update_farmer" ON public.products;
DROP POLICY IF EXISTS "products_delete_farmer" ON public.products;

DROP POLICY IF EXISTS "Public read videos" ON public.videos;
DROP POLICY IF EXISTS "videos_select_public" ON public.videos;
DROP POLICY IF EXISTS "videos_insert_farmer" ON public.videos;
DROP POLICY IF EXISTS "videos_update_farmer" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_farmer" ON public.videos;

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;

DROP POLICY IF EXISTS "follows_select_self_or_owned_farmer" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_authenticated" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;

DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_farmer" ON public.posts;
DROP POLICY IF EXISTS "posts_update_farmer" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_farmer" ON public.posts;

-- ---------------------------------------------------------------------------
-- J. RLS policies (STRICT)
-- ---------------------------------------------------------------------------

-- profiles: no public reads; own row only
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- farmer_profiles: public read; owner writes
CREATE POLICY "farmer_profiles_select_public"
  ON public.farmer_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "farmer_profiles_insert_own"
  ON public.farmer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "farmer_profiles_update_own"
  ON public.farmer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "farmer_profiles_delete_own"
  ON public.farmer_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

-- products
CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "products_insert_farmer"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "products_update_farmer"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "products_delete_farmer"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

-- videos
CREATE POLICY "videos_select_public"
  ON public.videos
  FOR SELECT
  USING (true);

CREATE POLICY "videos_insert_farmer"
  ON public.videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "videos_update_farmer"
  ON public.videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "videos_delete_farmer"
  ON public.videos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

-- posts
CREATE POLICY "posts_select_public"
  ON public.posts
  FOR SELECT
  USING (true);

CREATE POLICY "posts_insert_farmer"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "posts_update_farmer"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "posts_delete_farmer"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

-- reviews
CREATE POLICY "reviews_select_public"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- follows
CREATE POLICY "follows_select_self_or_owned_farmer"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = follows.farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "follows_insert_authenticated"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follows_delete_own"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- K. Backfill auth users missing profiles (production safety)
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, name, role, is_profile_complete, onboarding_step)
SELECT
  u.id,
  u.email,
  NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
  'buyer',
  false,
  1
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
