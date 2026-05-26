-- ============================================================================
-- Upgrade: remove DB business logic (triggers / become_farmer RPC).
-- RLS = access control only; app owns flows. Safe on DBs that had prior revision.
-- ============================================================================

-- Triggers removed (app mirrors review fields, farmer listing columns, promotion).
DROP TRIGGER IF EXISTS reviews_before_write_trigger ON public.reviews;
DROP TRIGGER IF EXISTS profiles_after_change_sync_farmer_public ON public.profiles;
DROP TRIGGER IF EXISTS profiles_before_update_enforce_role ON public.profiles;

DROP FUNCTION IF EXISTS public.reviews_before_write();
DROP FUNCTION IF EXISTS public.sync_farmer_public_fields_from_profile();
DROP FUNCTION IF EXISTS public.profiles_enforce_role_transition();
DROP FUNCTION IF EXISTS public.become_farmer();

-- Integrity: product row must match (product_id, farmer_id) on reviews.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_id_farmer_unique;
ALTER TABLE public.products
  ADD CONSTRAINT products_id_farmer_unique UNIQUE (id, farmer_id);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_farmer_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_farmer_id_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_product_farmer_fkey
  FOREIGN KEY (product_id, farmer_id)
  REFERENCES public.products (id, farmer_id)
  ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE;

-- Auth bootstrap only (idempotent profile row).
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

-- ---------------------------------------------------------------------------
-- RLS: drop and recreate (ownership / visibility only — no role checks)
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
  USING (auth.uid() = user_id);;
