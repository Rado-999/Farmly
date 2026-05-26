-- Profile onboarding state
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS is_profile_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_at timestamptz;

-- Farmer practice tags
ALTER TABLE public.farmer_profiles
  ADD COLUMN IF NOT EXISTS farming_types text[] DEFAULT '{}'::text[];

-- Backfill existing users who already have usable profiles
UPDATE public.profiles
SET
  is_profile_complete = true,
  onboarding_step = 99
WHERE
  name IS NOT NULL
  AND trim(name) <> ''
  AND (
    role = 'buyer'
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.profile_id = profiles.id
        AND fp.bio IS NOT NULL
        AND trim(fp.bio) <> ''
    )
  );

-- Avatar storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );;
