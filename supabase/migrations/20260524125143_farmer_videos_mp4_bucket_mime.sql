UPDATE storage.buckets
SET allowed_mime_types = ARRAY['video/mp4', 'image/jpeg']::text[]
WHERE id = 'farmer-videos';;
