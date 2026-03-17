-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user trigger function to also save email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Créer le profil avec email
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  
  -- Déterminer le rôle basé sur l'email
  IF new.email IN ('waldo.joseph@jaunemultiservices.com', 'admin@jaunemultiservices.com') THEN
    user_role := 'admin';
  ELSE
    user_role := 'cashier';
  END IF;
  
  -- Assigner le rôle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  RETURN new;
END;
$function$;

-- Create a function to safely delete users (admin only)
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the caller is an admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Check if trying to delete self
  IF auth.uid() = user_id_to_delete THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Delete from user_roles (will cascade to other tables as needed)
  DELETE FROM public.user_roles WHERE user_id = user_id_to_delete;
  
  -- Delete from profiles
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
  
  -- Note: We cannot delete from auth.users from here, but the above deletes
  -- will clean up the app-level data. The auth user will remain but be unusable.
END;
$function$;