-- Corriger le défaut de la devise dans la table accounts
ALTER TABLE public.accounts ALTER COLUMN currency SET DEFAULT 'HTG';

-- Corriger le défaut de la devise dans la table bank_info
ALTER TABLE public.bank_info ALTER COLUMN currency SET DEFAULT 'HTG';