-- Fix the cleanup_auth_user function to add proper authorization checks
-- This function currently allows any user to delete any other user by email
-- Adding admin-only access and self-deletion prevention

CREATE OR REPLACE FUNCTION public.cleanup_auth_user(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Check if caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can cleanup users';
  END IF;
  
  -- Find user ID
  SELECT id INTO user_id_to_delete
  FROM auth.users
  WHERE email = user_email;
  
  -- Prevent self-deletion
  IF user_id_to_delete = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  IF user_id_to_delete IS NOT NULL THEN
    -- Delete from auth.users (will cascade to other tables)
    DELETE FROM auth.users WHERE id = user_id_to_delete;
  END IF;
END;
$$;

-- Revoke public access and grant only to authenticated users
REVOKE ALL ON FUNCTION public.cleanup_auth_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_auth_user(text) TO authenticated;