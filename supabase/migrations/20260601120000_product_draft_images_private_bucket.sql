-- ============================================================================
-- Private storage for draft product images
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-draft-images',
  'product-draft-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "product_draft_images_select_farmer" ON storage.objects;
DROP POLICY IF EXISTS "product_draft_images_insert_farmer" ON storage.objects;
DROP POLICY IF EXISTS "product_draft_images_update_farmer" ON storage.objects;
DROP POLICY IF EXISTS "product_draft_images_delete_farmer" ON storage.objects;

CREATE POLICY "product_draft_images_select_farmer"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-draft-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "product_draft_images_insert_farmer"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-draft-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "product_draft_images_update_farmer"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-draft-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'product-draft-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "product_draft_images_delete_farmer"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-draft-images'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );
