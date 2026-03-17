-- Ajouter le champ is_active à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Mettre à jour la politique de sélection pour permettre aux admins de voir tous les profils
DROP POLICY IF EXISTS "View profiles based on role" ON public.profiles;

CREATE POLICY "View profiles based on role" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Permettre aux admins de mettre à jour tous les profils (pour activer/désactiver)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);