
-- Table pour les informations de la banque
CREATE TABLE public.bank_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Jaune Multi Services',
  logo_url text,
  currency text NOT NULL DEFAULT 'GHT',
  address text,
  phone text,
  email text,
  website text,
  slogan text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les succursales
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text NOT NULL,
  phone text,
  email text,
  manager_id uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ajouter la colonne branch_id aux user_roles pour affecter les admins aux succursales
ALTER TABLE public.user_roles ADD COLUMN branch_id uuid REFERENCES public.branches(id);

-- Ajouter la colonne branch_id aux comptes pour savoir où ils ont été créés
ALTER TABLE public.accounts ADD COLUMN branch_id uuid REFERENCES public.branches(id);

-- Ajouter la colonne branch_id aux transactions
ALTER TABLE public.transactions ADD COLUMN branch_id uuid REFERENCES public.branches(id);

-- Insérer les informations de base de la banque
INSERT INTO public.bank_info (name, currency, slogan) 
VALUES ('Jaune Multi Services', 'GHT', 'Votre partenaire financier de confiance');

-- Enable RLS
ALTER TABLE public.bank_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Policies pour bank_info (lecture pour tous les authentifiés, modification pour admins)
CREATE POLICY "Authenticated users can view bank info"
ON public.bank_info FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update bank info"
ON public.bank_info FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert bank info"
ON public.bank_info FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour branches
CREATE POLICY "Authenticated users can view branches"
ON public.branches FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage branches"
ON public.branches FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers pour updated_at
CREATE TRIGGER update_bank_info_updated_at
BEFORE UPDATE ON public.bank_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
