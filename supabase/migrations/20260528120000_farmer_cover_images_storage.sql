-- ============================================================================
-- Farmer profile cover images: storage bucket + RLS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'farmer-covers',
  'farmer-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "farmer_covers_select_public" ON storage.objects;
DROP POLICY IF EXISTS "farmer_covers_insert_farmer" ON storage.objects;
DROP POLICY IF EXISTS "farmer_covers_update_farmer" ON storage.objects;
DROP POLICY IF EXISTS "farmer_covers_delete_farmer" ON storage.objects;

CREATE POLICY "farmer_covers_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'farmer-covers');

CREATE POLICY "farmer_covers_insert_farmer"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'farmer-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "farmer_covers_update_farmer"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'farmer-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'farmer-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "farmer_covers_delete_farmer"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'farmer-covers'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );
