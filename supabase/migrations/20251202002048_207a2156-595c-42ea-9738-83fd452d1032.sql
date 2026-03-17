-- Corriger la fonction cleanup_auth_user avec le search_path approprié
CREATE OR REPLACE FUNCTION public.cleanup_auth_user(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Trouver l'ID de l'utilisateur
  SELECT id INTO user_id_to_delete
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_to_delete IS NOT NULL THEN
    -- Supprimer de auth.users (cela cascadera aux autres tables)
    DELETE FROM auth.users WHERE id = user_id_to_delete;
  END IF;
END;
$$;