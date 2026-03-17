-- Créer une fonction pour supprimer complètement un utilisateur de auth.users
CREATE OR REPLACE FUNCTION public.cleanup_auth_user(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Nettoyer l'utilisateur waldojoseph163@gmail.com
SELECT public.cleanup_auth_user('waldojoseph163@gmail.com');