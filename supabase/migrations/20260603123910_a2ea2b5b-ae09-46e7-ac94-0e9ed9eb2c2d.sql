
CREATE POLICY "public_read_media_bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');
