-- Align farmer-videos bucket with Supabase Free global max (50 MB)

UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'farmer-videos';
