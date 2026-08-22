
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.log_cafe_status_change() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.manage_cafe_session() FROM PUBLIC, authenticated, anon;
