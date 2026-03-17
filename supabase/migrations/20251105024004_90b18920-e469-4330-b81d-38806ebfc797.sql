-- Create enum types
CREATE TYPE account_type AS ENUM ('savings', 'checking', 'investment');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'closed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'loan_payment', 'interest');
CREATE TYPE loan_status AS ENUM ('pending', 'active', 'completed', 'defaulted');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE document_type AS ENUM ('passport', 'id_card', 'driver_license');
CREATE TYPE activity_type AS ENUM ('salary', 'student', 'scholar', 'self_employed');

-- Table des comptes bancaires
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL UNIQUE,
  account_type account_type NOT NULL,
  status account_status NOT NULL DEFAULT 'active',
  
  -- Informations personnelles
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  gender gender_type NOT NULL,
  birth_date DATE NOT NULL,
  birth_place TEXT NOT NULL,
  
  -- Document d'identification
  document_type document_type NOT NULL,
  document_number TEXT NOT NULL,
  
  -- Contact
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- Activité professionnelle
  activity activity_type NOT NULL,
  
  -- Informations financières
  balance DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  initial_deposit DECIMAL(15,2) NOT NULL CHECK (initial_deposit >= 500),
  currency TEXT NOT NULL DEFAULT 'GHT',
  
  -- Photo (URL vers le stockage)
  photo_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT valid_age CHECK (birth_date <= CURRENT_DATE - INTERVAL '18 years'),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9\s\-\(\)]+$')
);

-- Table des transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  
  -- Pour les transferts
  destination_account_id UUID REFERENCES public.accounts(id),
  
  description TEXT,
  reference TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Contraintes
  CONSTRAINT valid_transfer CHECK (
    (type = 'transfer' AND destination_account_id IS NOT NULL) OR 
    (type != 'transfer' AND destination_account_id IS NULL)
  )
);

-- Table des prêts
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  
  total_amount DECIMAL(15,2) NOT NULL,
  remaining_amount DECIMAL(15,2) NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  
  status loan_status NOT NULL DEFAULT 'pending',
  
  start_date DATE,
  end_date DATE,
  next_payment_date DATE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contraintes
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- Table des paiements de prêts
CREATE TABLE public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id),
  
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Table des rapports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT NOT NULL UNIQUE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Statistiques
  total_deposits DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_withdrawals DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_transfers DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_loan_payments DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  active_accounts INTEGER NOT NULL DEFAULT 0,
  new_accounts INTEGER NOT NULL DEFAULT 0,
  total_loans DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour accounts
CREATE POLICY "Authenticated users can view all accounts"
ON public.accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can create accounts"
ON public.accounts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update accounts"
ON public.accounts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete accounts"
ON public.accounts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies pour transactions
CREATE POLICY "Authenticated users can view all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies pour loans
CREATE POLICY "Authenticated users can view all loans"
ON public.loans FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create loans"
ON public.loans FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update loans"
ON public.loans FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies pour loan_payments
CREATE POLICY "Authenticated users can view all loan payments"
ON public.loan_payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create loan payments"
ON public.loan_payments FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies pour reports
CREATE POLICY "Authenticated users can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can create reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer les numéros de compte
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'ACC' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = new_number);
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique account number';
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer les numéros de transaction
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TXN' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer les numéros de prêt
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LOAN' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer les numéros de compte
CREATE OR REPLACE FUNCTION set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
    NEW.account_number := generate_account_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_account_number_trigger
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION set_account_number();

-- Trigger pour auto-générer les numéros de transaction
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_number_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION set_transaction_number();

-- Trigger pour auto-générer les numéros de prêt
CREATE OR REPLACE FUNCTION set_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.loan_number IS NULL OR NEW.loan_number = '' THEN
    NEW.loan_number := generate_loan_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_number_trigger
  BEFORE INSERT ON public.loans
  FOR EACH ROW EXECUTE FUNCTION set_loan_number();

-- Fonction pour mettre à jour le solde du compte après transaction
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le solde et la date de dernière activité
  UPDATE public.accounts
  SET 
    balance = NEW.balance_after,
    last_activity = NEW.created_at
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Index pour améliorer les performances
CREATE INDEX idx_accounts_account_number ON public.accounts(account_number);
CREATE INDEX idx_accounts_status ON public.accounts(status);
CREATE INDEX idx_accounts_created_at ON public.accounts(created_at);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_loans_account_id ON public.loans(account_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loan_payments_loan_id ON public.loan_payments(loan_id);