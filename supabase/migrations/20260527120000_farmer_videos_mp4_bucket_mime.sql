-- Restrict farmer-videos bucket to formats we support for reliable web playback
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['video/mp4', 'image/jpeg']::text[]
WHERE id = 'farmer-videos';
