
-- 1. Restrict writes on user_roles to existing admins only
CREATE POLICY "admins_insert_user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins_update_user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins_delete_user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Drop the duplicate storage policy (keep `public_read_media_bucket`)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
