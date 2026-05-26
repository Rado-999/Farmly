-- Farmer products: draft/publish, unit pricing, RLS, product-images storage

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS price_unit text NOT NULL DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status IN ('draft', 'published'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_unit_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_price_unit_check
  CHECK (price_unit IN ('kg', 'box', 'l', 'piece'));

UPDATE public.products
SET
  status = 'published',
  published_at = COALESCE(published_at, now());

DROP POLICY IF EXISTS "products_select_public" ON public.products;

CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "products_select_owner"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "product_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_farmer" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_farmer" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_farmer" ON storage.objects;

CREATE POLICY "product_images_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_farmer"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "product_images_update_farmer"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "product_images_delete_farmer"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );;
