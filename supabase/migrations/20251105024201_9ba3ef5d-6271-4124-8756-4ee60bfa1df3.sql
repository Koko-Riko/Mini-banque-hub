-- Fix search_path security issues for all functions

-- 1. Fix update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Fix generate_account_number
DROP FUNCTION IF EXISTS generate_account_number() CASCADE;
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
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. Fix generate_transaction_number
DROP FUNCTION IF EXISTS generate_transaction_number() CASCADE;
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TXN' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. Fix generate_loan_number
DROP FUNCTION IF EXISTS generate_loan_number() CASCADE;
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LOAN' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. Fix set_account_number
DROP FUNCTION IF EXISTS set_account_number() CASCADE;
CREATE OR REPLACE FUNCTION set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
    NEW.account_number := generate_account_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_account_number_trigger
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION set_account_number();

-- 6. Fix set_transaction_number
DROP FUNCTION IF EXISTS set_transaction_number() CASCADE;
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_transaction_number_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION set_transaction_number();

-- 7. Fix set_loan_number
DROP FUNCTION IF EXISTS set_loan_number() CASCADE;
CREATE OR REPLACE FUNCTION set_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.loan_number IS NULL OR NEW.loan_number = '' THEN
    NEW.loan_number := generate_loan_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_loan_number_trigger
  BEFORE INSERT ON public.loans
  FOR EACH ROW EXECUTE FUNCTION set_loan_number();

-- 8. Fix update_account_balance
DROP FUNCTION IF EXISTS update_account_balance() CASCADE;
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.accounts
  SET 
    balance = NEW.balance_after,
    last_activity = NEW.created_at
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_balance_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();