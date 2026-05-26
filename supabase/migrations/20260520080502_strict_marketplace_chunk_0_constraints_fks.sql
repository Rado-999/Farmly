-- A. Clean orphans
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

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_farmer_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_farmer_id_fkey
  FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles (id) ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE;

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
  FOREIGN KEY (profile_id) REFERENCES public.profiles (id) ON DELETE CASCADE;;
