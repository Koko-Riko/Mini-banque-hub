-- Fix 1: Restrict profile visibility based on branch scope
-- Branch admins should only see users in their branch, not all users

DROP POLICY IF EXISTS "View profiles based on role" ON public.profiles;

CREATE POLICY "View profiles based on role and branch"
ON public.profiles FOR SELECT
USING (
  -- Users can view their own profile
  (auth.uid() = user_id)
  OR
  -- General admins (without branch) can view all profiles
  is_general_admin(auth.uid())
  OR
  -- Branch admins can only view profiles of users in their branch
  (
    has_role(auth.uid(), 'admin'::app_role) 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = profiles.user_id
      AND ur.branch_id = get_user_branch_id(auth.uid())
    )
  )
);

-- Fix 2: Restrict function execution privileges for security-sensitive functions
-- Only authenticated users should be able to execute these functions

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_general_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_general_admin(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_branch_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_branch_id(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;