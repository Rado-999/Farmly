-- ============================================================================
-- Farmer videos: poster + duration columns, farmer-videos storage bucket
-- ============================================================================

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_duration_seconds_check;
ALTER TABLE public.videos
  ADD CONSTRAINT videos_duration_seconds_check
  CHECK (duration_seconds IS NULL OR duration_seconds > 0);

-- ---------------------------------------------------------------------------
-- Storage: farmer-videos bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'farmer-videos',
  'farmer-videos',
  true,
  52428800,
  ARRAY['video/mp4', 'image/jpeg']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "farmer_videos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "farmer_videos_insert_farmer" ON storage.objects;
DROP POLICY IF EXISTS "farmer_videos_update_farmer" ON storage.objects;
DROP POLICY IF EXISTS "farmer_videos_delete_farmer" ON storage.objects;

CREATE POLICY "farmer_videos_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'farmer-videos');

CREATE POLICY "farmer_videos_insert_farmer"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'farmer-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "farmer_videos_update_farmer"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'farmer-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'farmer-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "farmer_videos_delete_farmer"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'farmer-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT fp.id::text
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = auth.uid()
    )
  );
